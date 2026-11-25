import { randomUUID } from 'node:crypto'
import { Prisma, type PrismaClient } from 'generated/prisma'

interface LeasedEvent {
  eventId: string
  aggregateId: string
  envelope: unknown
  attempts: number
  leaseToken: string
}

export class OutboxPublications {
  private readonly table: Prisma.Sql
  private readonly identity: Prisma.Sql

  constructor(
    private readonly db: PrismaClient,
    source: 'session' | 'badge'
  ) {
    this.table =
      source === 'session'
        ? Prisma.sql`session_event_outbox`
        : Prisma.sql`badge_event_outbox`
    this.identity =
      source === 'session' ? Prisma.sql`"sessionId"` : Prisma.sql`"userBadgeId"`
  }

  reserve(limit: number, leaseMs: number) {
    const token = randomUUID()
    return this.db.$queryRaw<LeasedEvent[]>`
      WITH candidates AS (
        SELECT "eventId"
        FROM ${this.table}
        WHERE status = 'PENDING' AND "nextAttemptAt" <= clock_timestamp()
          AND ("leaseUntil" IS NULL OR "leaseUntil" <= clock_timestamp())
        ORDER BY "nextAttemptAt", "eventId"
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE ${this.table} AS outbox
      SET "leaseToken" = ${token}::uuid,
          "leaseUntil" = clock_timestamp() + ${leaseMs} * interval '1 millisecond',
          attempts = outbox.attempts + 1
      FROM candidates
      WHERE outbox."eventId" = candidates."eventId"
      RETURNING outbox."eventId", outbox.${this.identity} AS "aggregateId", outbox.envelope,
                outbox.attempts, outbox."leaseToken"
    `
  }

  published(event: LeasedEvent) {
    return this.db.$executeRaw`
      UPDATE ${this.table}
      SET status = 'PUBLISHED', "publishedAt" = clock_timestamp(),
          "leaseToken" = NULL, "leaseUntil" = NULL, "lastError" = NULL
      WHERE "eventId" = ${event.eventId}::uuid AND status = 'PENDING'
        AND "leaseToken" = ${event.leaseToken}::uuid AND "leaseUntil" > clock_timestamp()
    `
  }

  retry(event: LeasedEvent, delayMs: number, reason: string) {
    return this.db.$executeRaw`
      UPDATE ${this.table}
      SET "nextAttemptAt" = clock_timestamp() + ${delayMs} * interval '1 millisecond',
          "leaseToken" = NULL, "leaseUntil" = NULL, "lastError" = ${reason}
      WHERE "eventId" = ${event.eventId}::uuid AND status = 'PENDING'
        AND "leaseToken" = ${event.leaseToken}::uuid AND "leaseUntil" > clock_timestamp()
    `
  }

  async backlog() {
    const [stats] = await this.db.$queryRaw<
      { pending: number; oldestAt: Date | null }[]
    >`
      SELECT count(*)::int AS pending, min("createdAt") AS "oldestAt"
      FROM ${this.table} WHERE status = 'PENDING'
    `
    return stats
  }
}
