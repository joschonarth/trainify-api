import 'dotenv/config'

import { setTimeout as sleep } from 'node:timers/promises'
import { PrismaPg } from '@prisma/adapter-pg'
import fastify from 'fastify'
import { PrismaClient } from 'generated/prisma'
import {
  consumerConfigSchema,
  outboxWorkerConfigSchema,
} from '@/modules/session/events/publisher/outbox-worker-config'
import { RabbitSessionEventPublisher } from '@/modules/session/events/publisher/rabbit-session-event-publisher'
import { SessionOutboxPublications } from '@/modules/session/events/publisher/session-outbox-publications'
import { workoutFinalizedV1Schema } from '@/modules/session/events/workout-finalized-v1'

async function startOutboxWorker() {
  const config = outboxWorkerConfigSchema.parse(process.env)
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: config.DATABASE_URL,
      connectionTimeoutMillis: config.OUTBOX_CONFIRM_TIMEOUT_MS,
      statement_timeout: config.OUTBOX_CONFIRM_TIMEOUT_MS,
    }),
  })
  const outbox = new SessionOutboxPublications(db)
  const broker = new RabbitSessionEventPublisher(
    config.RABBITMQ_URL,
    config.OUTBOX_CONFIRM_TIMEOUT_MS
  )
  const app = fastify({ logger: true })
  const stop = new AbortController()
  const consumer = await makeConsumer()
  let consuming: Promise<void> | undefined
  let databaseReady = false
  let lastBacklogCheck = 0
  let shuttingDown: NodeJS.Timeout | undefined

  app.get('/health', (_request, reply) => {
    const ready =
      !stop.signal.aborted &&
      databaseReady &&
      broker.ready &&
      (consumer?.ready ?? true)
    return reply
      .code(ready ? 200 : 503)
      .send({ status: ready ? 'ok' : 'unavailable' })
  })

  async function makeConsumer() {
    if (
      process.env.NODE_ENV !== 'test' ||
      process.env.GAMIFICATION_CONSUMER_ENABLED !== 'true'
    ) {
      return
    }
    const settings = consumerConfigSchema.parse(process.env)
    const { ProcessWorkoutFinalized } = await import(
      '@/modules/gamification/processing/process-workout-finalized'
    )
    const { WorkoutFinalizedConsumer } = await import(
      '@/modules/gamification/processing/workout-finalized-consumer'
    )
    return new WorkoutFinalizedConsumer(
      new RabbitSessionEventPublisher(
        config.RABBITMQ_URL,
        config.OUTBOX_CONFIRM_TIMEOUT_MS
      ),
      new ProcessWorkoutFinalized(db, {
        leaseMs: settings.GAMIFICATION_CONSUMER_LEASE_MS,
        retryMs: settings.GAMIFICATION_CONSUMER_RETRY_MS,
        maxAttempts: settings.GAMIFICATION_CONSUMER_MAX_ATTEMPTS,
      }),
      app.log,
      {
        prefetch: settings.GAMIFICATION_CONSUMER_PREFETCH,
        pollMs: config.OUTBOX_POLL_MS,
      }
    )
  }

  async function reportBacklog() {
    if (Date.now() - lastBacklogCheck < 60_000) {
      return
    }
    const stats = await outbox.backlog()
    lastBacklogCheck = Date.now()
    const ageMs = stats?.oldestAt
      ? Math.max(0, Date.now() - stats.oldestAt.getTime())
      : 0
    const fields = { pending: stats?.pending ?? 0, oldestAgeMs: ageMs }
    if (ageMs >= config.OUTBOX_BACKLOG_WARN_MS) {
      app.log.warn(fields, 'Outbox backlog exceeds age threshold')
    } else {
      app.log.info(fields, 'Outbox backlog')
    }
  }

  async function publishBatch() {
    const events = await outbox.reserve(
      config.OUTBOX_BATCH_SIZE,
      config.OUTBOX_LEASE_MS
    )
    const updates = await Promise.allSettled(
      events.map(async (event) => {
        const parsed = workoutFinalizedV1Schema.safeParse(event.envelope)
        const valid =
          parsed.success &&
          parsed.data.eventId === event.eventId &&
          parsed.data.data.sessionId === event.sessionId
        const result = valid
          ? await broker.publish(parsed.data)
          : 'invalid_envelope'
        const fields = {
          eventId: event.eventId,
          sessionId: event.sessionId,
          correlationId: valid ? parsed.data.correlationId : undefined,
          attempts: event.attempts,
        }
        const delayMs = Math.min(
          config.OUTBOX_MAX_RETRY_MS,
          1000 * 2 ** Math.min(event.attempts - 1, 31)
        )
        const updated =
          result === 'confirmed'
            ? await outbox.published(event)
            : await outbox.retry(event, delayMs, result)
        if (updated === 0) {
          app.log.warn(
            fields,
            'Outbox lease expired before writing publication result'
          )
        } else if (result === 'confirmed') {
          app.log.info(fields, 'Outbox event published')
        } else {
          app.log.warn(
            { ...fields, reason: result, delayMs },
            'Outbox publication will retry'
          )
        }
      })
    )
    databaseReady = !updates.some((result) => result.status === 'rejected')
    if (!databaseReady) {
      app.log.error('Failed to persist one or more outbox publication results')
    }
  }

  function shutdown() {
    if (stop.signal.aborted) {
      return
    }
    stop.abort()
    shuttingDown = setTimeout(() => {
      app.log.error('Outbox worker shutdown timed out')
      process.exit(1)
    }, config.OUTBOX_SHUTDOWN_MS)
    shuttingDown.unref()
  }

  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
  try {
    await app.listen({ host: '0.0.0.0', port: config.OUTBOX_HEALTH_PORT })
    consuming = consumer?.run(stop.signal)
    while (!stop.signal.aborted) {
      try {
        await reportBacklog()
      } catch {
        databaseReady = false
        app.log.error('Outbox backlog query failed')
      }

      try {
        if (databaseReady || lastBacklogCheck > 0) {
          await broker.open()
        }
      } catch {
        app.log.warn('RabbitMQ connection or topology unavailable')
      }
      if (!stop.signal.aborted && broker.ready) {
        try {
          await publishBatch()
        } catch {
          databaseReady = false
          app.log.error('Outbox reservation failed')
        }
      }
      if (!stop.signal.aborted) {
        await sleep(config.OUTBOX_POLL_MS, undefined, {
          signal: stop.signal,
        }).catch(() => undefined)
      }
    }
  } finally {
    stop.abort()
    try {
      await Promise.all([app.close(), broker.close(), consuming])
    } finally {
      await db.$disconnect()
      clearTimeout(shuttingDown)
      process.removeListener('SIGINT', shutdown)
      process.removeListener('SIGTERM', shutdown)
    }
  }
}

if (process.env.OUTBOX_PUBLISHER_ENABLED === 'true') {
  startOutboxWorker().catch(() => {
    console.error('Outbox worker startup or shutdown failed')
    process.exitCode = 1
  })
} else {
  // A disabled worker must not connect to either service or reserve events.
  console.info('Outbox publisher is disabled')
}
