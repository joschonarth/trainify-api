import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma'
import { z } from 'zod'
import { replayFailedProcessing } from '@/modules/gamification/processing/replay-failed-processing'

const argumentsSchema = z.tuple([
  z.uuid(),
  z.string().trim().min(1).max(100),
  z.string().trim().min(1).max(255),
])
const databaseUrlSchema = z.url({ protocol: /^postgres(?:ql)?$/ })

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
