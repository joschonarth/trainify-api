import 'dotenv/config'

import { setTimeout as sleep } from 'node:timers/promises'
import { PrismaPg } from '@prisma/adapter-pg'
import fastify from 'fastify'
import { PrismaClient } from 'generated/prisma'
import {
  consumerConfigSchema,
  outboxWorkerConfigSchema,
} from '@/config/outbox-worker-config'
import { OutboxPublications } from '@/infra/outbox/outbox-publications'
import {
  BADGE_UNLOCKED_DLQ,
  BADGE_UNLOCKED_QUEUE,
  declareBadgeUnlockedTopology,
} from '@/infra/rabbitmq/badge-unlocked-topology'
import { RabbitMqClient } from '@/infra/rabbitmq/rabbitmq-client'
import { RabbitMqEventConsumer } from '@/infra/rabbitmq/rabbitmq-event-consumer'
import {
  declareWorkoutFinalizedConsumerTopology,
  declareWorkoutFinalizedTopology,
  SESSION_EVENTS_EXCHANGE,
} from '@/infra/rabbitmq/workout-finalized-topology'
import { badgeUnlockedV1Schema } from '@/modules/gamification/badge/events/badge-unlocked-v1'
import { ProcessBadgeUnlocked } from '@/modules/notification/process-badge-unlocked'
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
  const app = fastify({ logger: true })
  const stop = new AbortController()
  const consumer = await makeConsumer()
  const badgeConsumer = makeBadgeConsumer()
  const sessionPublisher = makePublisher(
    'session',
    declareWorkoutFinalizedTopology,
    config.OUTBOX_BATCH_SIZE,
    (envelope, id) => {
      const parsed = workoutFinalizedV1Schema.safeParse(envelope)
      return parsed.success && parsed.data.data.sessionId === id
        ? parsed.data
        : undefined
    }
  )
  const badgePublisher =
    process.env.BADGE_OUTBOX_PUBLISHER_ENABLED === 'true'
      ? makePublisher(
          'badge',
          declareBadgeUnlockedTopology,
          config.BADGE_OUTBOX_BATCH_SIZE,
          (envelope, id) => {
            const parsed = badgeUnlockedV1Schema.safeParse(envelope)
            return parsed.success && parsed.data.data.userBadgeId === id
              ? parsed.data
              : undefined
          }
        )
      : undefined
  const publishers = badgePublisher
    ? [sessionPublisher, badgePublisher]
    : [sessionPublisher]
  let shuttingDown: NodeJS.Timeout | undefined

  app.get('/health', (_request, reply) => {
    const ready =
      !stop.signal.aborted &&
      publishers.every((publisher) => publisher.ready) &&
      (consumer?.ready ?? true) &&
      (badgeConsumer?.ready ?? true)
    return reply
      .code(ready ? 200 : 503)
      .send({ status: ready ? 'ok' : 'unavailable' })
  })

  function makeBadgeConsumer() {
    if (process.env.BADGE_NOTIFICATIONS_CONSUMER_ENABLED !== 'true') {
      return
    }
    return new RabbitMqEventConsumer(
      new RabbitMqClient(
        config.RABBITMQ_URL,
        config.OUTBOX_CONFIRM_TIMEOUT_MS,
        declareBadgeUnlockedTopology
      ),
      new ProcessBadgeUnlocked(db, {
        retryMs: config.BADGE_NOTIFICATIONS_RETRY_MS,
        maxAttempts: config.BADGE_NOTIFICATIONS_MAX_ATTEMPTS,
      }),
      app.log,
      {
        prefetch: config.BADGE_NOTIFICATIONS_PREFETCH,
        pollMs: config.OUTBOX_POLL_MS,
        queue: BADGE_UNLOCKED_QUEUE,
        dlq: BADGE_UNLOCKED_DLQ,
        schema: badgeUnlockedV1Schema,
        depthPollMs: 60_000,
      }
    )
  }

  async function makeConsumer() {
    if (process.env.GAMIFICATION_CONSUMER_ENABLED !== 'true') {
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
      new RabbitMqClient(
        config.RABBITMQ_URL,
        config.OUTBOX_CONFIRM_TIMEOUT_MS,
        declareWorkoutFinalizedConsumerTopology
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

  function makePublisher(
    source: 'session' | 'badge',
    declareTopology: ConstructorParameters<typeof RabbitMqClient>[2],
    batchSize: number,
    parseEnvelope: (
      value: unknown,
      aggregateId: string
    ) => { eventId: string; type: string; correlationId: string } | undefined
  ) {
    const outbox = new OutboxPublications(db, source)
    const broker = new RabbitMqClient(
      config.RABBITMQ_URL,
      config.OUTBOX_CONFIRM_TIMEOUT_MS,
      declareTopology
    )
    let databaseReady = false
    let lastBacklogCheck = 0
    async function reportBacklog() {
      if (Date.now() - lastBacklogCheck < 60_000) {
        return
      }
      const stats = await outbox.backlog()
      lastBacklogCheck = Date.now()
      const ageMs = stats?.oldestAt
        ? Math.max(0, Date.now() - stats.oldestAt.getTime())
        : 0
      const fields = {
        source,
        pending: stats?.pending ?? 0,
        oldestAgeMs: ageMs,
      }
      if (ageMs >= config.OUTBOX_BACKLOG_WARN_MS) {
        app.log.warn(fields, 'Outbox backlog exceeds age threshold')
      } else {
        app.log.info(fields, 'Outbox backlog')
      }
    }

    async function publishBatch() {
      const events = await outbox.reserve(batchSize, config.OUTBOX_LEASE_MS)
      const updates = await Promise.allSettled(
        events.map(async (event) => {
          const envelope = parseEnvelope(event.envelope, event.aggregateId)
          const valid = envelope?.eventId === event.eventId
          const result = valid
            ? await broker.publish(
                SESSION_EVENTS_EXCHANGE,
                envelope.type,
                envelope,
                {
                  messageId: envelope.eventId,
                  correlationId: envelope.correlationId,
                  type: envelope.type,
                }
              )
            : 'invalid_envelope'
          const fields = {
            eventId: event.eventId,
            source,
            ...(source === 'session'
              ? { sessionId: event.aggregateId }
              : { userBadgeId: event.aggregateId }),
            correlationId: envelope?.correlationId,
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
            return
          }
          if (result === 'confirmed') {
            app.log.info(fields, 'Outbox event published')
            return
          }
          app.log.warn(
            { ...fields, reason: result, delayMs },
            'Outbox publication will retry'
          )
        })
      )
      databaseReady = !updates.some((result) => result.status === 'rejected')
      if (!databaseReady) {
        app.log.error(
          'Failed to persist one or more outbox publication results'
        )
      }
    }

    async function publishCycle() {
      try {
        await reportBacklog()
      } catch {
        databaseReady = false
        app.log.error({ source }, 'Outbox backlog query failed')
      }

      try {
        if (lastBacklogCheck > 0) {
          await broker.open()
        }
      } catch {
        app.log.warn({ source }, 'RabbitMQ connection or topology unavailable')
      }
      if (stop.signal.aborted || !broker.ready) {
        return
      }
      try {
        await publishBatch()
      } catch {
        databaseReady = false
        app.log.error({ source }, 'Outbox reservation failed')
      }
    }

    async function run() {
      try {
        while (!stop.signal.aborted) {
          await publishCycle()
          await sleep(config.OUTBOX_POLL_MS, undefined, {
            signal: stop.signal,
          }).catch(() => undefined)
        }
      } finally {
        await broker.close()
      }
    }
    return {
      get ready() {
        return databaseReady && broker.ready
      },
      run,
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
  const running: Promise<void>[] = []
  try {
    await app.listen({ host: '0.0.0.0', port: config.OUTBOX_HEALTH_PORT })
    if (consumer) {
      running.push(consumer.run(stop.signal))
    }
    if (badgeConsumer) {
      running.push(badgeConsumer.run(stop.signal))
    }
    running.push(...publishers.map((publisher) => publisher.run()))
    await Promise.all(running)
  } finally {
    stop.abort()
    try {
      await Promise.allSettled([app.close(), ...running])
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
