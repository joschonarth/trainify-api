import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma'
import { z } from 'zod'
import { WORKOUT_FINALIZED_V1 } from '@/modules/session/events/workout-finalized-v1'

const argumentsSchema = z.tuple([
  z.uuid(),
  z.string().trim().min(1).max(100),
  z.string().trim().min(1).max(255),
])
const databaseUrlSchema = z.url({ protocol: /^postgres(?:ql)?$/ })

export async function replayFailedProcessing(
  db: PrismaClient,
  eventId: string,
  operator: string,
  reason: string
) {
  return await db.$transaction(async (transaction) => {
    const processing = await transaction.sessionEventProcessing.updateMany({
      where: { eventId, status: 'FAILED' },
      data: {
        status: 'PENDING',
        attempts: 0,
        leaseToken: null,
        leaseUntil: null,
        nextAttemptAt: null,
        lastError: null,
      },
    })
    if (processing.count !== 1) {
      throw new Error('Only failed processings can be replayed.')
    }
    const outbox = await transaction.sessionEventOutbox.updateMany({
      where: { eventId, type: WORKOUT_FINALIZED_V1 },
      data: {
        status: 'PENDING',
        nextAttemptAt: new Date(),
        publishedAt: null,
        leaseToken: null,
        leaseUntil: null,
        lastError: null,
      },
    })
    if (outbox.count !== 1) {
      throw new Error('Outbox event unavailable.')
    }
    await transaction.sessionEventProcessingReplay.create({
      data: { eventId, operator, reason },
    })
  })
}

async function main() {
  const parsed = argumentsSchema.safeParse(process.argv.slice(2))
  const url = databaseUrlSchema.safeParse(process.env.DATABASE_URL)
  if (!(parsed.success && url.success)) {
    console.error(
      'Usage: npm run replay:processing -- <processing-id> <operator> <reason>'
    )
    process.exitCode = 1
    return
  }
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url.data }),
  })
  try {
    await replayFailedProcessing(db, ...parsed.data)
    console.info('Replay scheduled', { eventId: parsed.data[0] })
  } finally {
    await db.$disconnect()
  }
}

main().catch(() => {
  console.error(
    'Replay failed. Verify that the processing is FAILED and its outbox event exists.'
  )
  process.exitCode = 1
})
