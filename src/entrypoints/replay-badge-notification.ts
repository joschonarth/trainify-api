import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma'
import { z } from 'zod'
import { replayBadgeNotification } from '@/modules/notification/replay-badge-notification'

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
      'Usage: npm run replay:badge-notification -- <event-id> <operator> <reason>'
    )
    process.exitCode = 1
    return
  }
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url.data }),
  })
  try {
    await replayBadgeNotification(db, ...parsed.data)
    console.info('Badge notification replay scheduled', {
      eventId: parsed.data[0],
    })
  } finally {
    await db.$disconnect()
  }
}

main().catch(() => {
  console.error(
    'Replay failed. Verify that the badge outbox event is valid and PUBLISHED.'
  )
  process.exitCode = 1
})
