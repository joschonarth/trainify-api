import { randomUUID } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import type { PrismaClient } from 'generated/prisma'
import type { WorkoutFinalizedV1 } from '@/modules/session/events/workout-finalized-v1'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { makeUnlockAllBadgesUseCase } from '../badge/use-cases/factories/make-unlock-all-badges-use-case'
import { PrismaStreakUnitOfWork } from '../streak/repositories/prisma/prisma-streak-unit-of-work'
import { UpdateUserStreakUseCase } from '../streak/use-cases/update-user-streak.use-case'

export type ProcessingOutcome =
  | 'completed'
  | 'waiting'
  | 'retry_scheduled'
  | 'invalid_event'
  | 'attempts_exhausted'
  | 'user_not_found'

export class ProcessWorkoutFinalized {
  private readonly streak: UpdateUserStreakUseCase

  constructor(
    private readonly db: PrismaClient,
    private readonly config: {
      leaseMs: number
      maxAttempts: number
      retryMs: number
    }
  ) {
    this.streak = new UpdateUserStreakUseCase(new PrismaStreakUnitOfWork(db))
  }

  async execute(event: WorkoutFinalizedV1): Promise<ProcessingOutcome> {
    const { eventId, data } = event
    const source = await this.db.sessionEventOutbox.findUnique({
      where: { eventId },
      select: { envelope: true },
    })
    if (!isDeepStrictEqual(source?.envelope, event)) {
      return 'invalid_event'
    }

    const leaseToken = randomUUID()
    const [{ attempts } = { attempts: 0 }] = await this.db.$queryRaw<
      { attempts: number }[]
    >`
      UPDATE session_event_processings
      SET status = 'PROCESSING', attempts = attempts + 1,
          "leaseToken" = ${leaseToken}::uuid,
          "leaseUntil" = clock_timestamp() + ${this.config.leaseMs} * interval '1 millisecond',
          "updatedAt" = clock_timestamp()
      WHERE "eventId" = ${eventId}::uuid
        AND "sessionId" = ${data.sessionId} AND "userId" = ${data.userId}
        AND attempts < ${this.config.maxAttempts}
        AND (status = 'PENDING' OR (status = 'PROCESSING' AND "leaseUntil" <= clock_timestamp()))
        AND ("nextAttemptAt" IS NULL OR "nextAttemptAt" <= clock_timestamp())
      RETURNING attempts
    `
    if (attempts === 0) {
      return await this.getOutcome(event)
    }

    try {
      if (data.hasActivity) {
        await this.streak.execute({
          userId: data.userId,
          logDate: new Date(data.completedAt),
          creditDay: {
            businessDate: data.businessDate,
            timezone: data.timezone,
          },
        })
      }
      return await this.complete(event, leaseToken)
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return await this.recordFailure(eventId, leaseToken, 'user_not_found')
      }
      const failure =
        attempts >= this.config.maxAttempts ? 'attempts_exhausted' : 'waiting'
      return await this.recordFailure(eventId, leaseToken, failure)
    }
  }

  private async getOutcome({
    eventId,
    data,
  }: WorkoutFinalizedV1): Promise<ProcessingOutcome> {
    // A crash can consume the final attempt without reporting its failure.
    await this.db.$executeRaw`
      UPDATE session_event_processings
      SET status = 'FAILED', "lastError" = 'attempts_exhausted', "updatedAt" = clock_timestamp(),
          "leaseToken" = NULL, "leaseUntil" = NULL, "nextAttemptAt" = NULL
      WHERE "eventId" = ${eventId}::uuid AND "sessionId" = ${data.sessionId} AND "userId" = ${data.userId}
        AND attempts >= ${this.config.maxAttempts}
        AND (status = 'PENDING' OR (status = 'PROCESSING' AND "leaseUntil" <= clock_timestamp()))
    `
    const row = await this.db.sessionEventProcessing.findUnique({
      where: { eventId, sessionId: data.sessionId, userId: data.userId },
    })
    switch (row?.status) {
      case 'COMPLETED':
        return 'completed'
      case 'FAILED':
        return row.lastError === 'user_not_found'
          ? 'user_not_found'
          : 'attempts_exhausted'
      case 'PENDING':
      case 'PROCESSING':
        return 'waiting'
      default:
        return 'invalid_event'
    }
  }

  private async complete(
    { eventId, data }: WorkoutFinalizedV1,
    leaseToken: string
  ): Promise<ProcessingOutcome> {
    return await this.db.$transaction(async (transaction) => {
      // Match the lock order used by streak and planning changes.
      const users = await transaction.$queryRaw<
        { id: string }[]
      >`SELECT id FROM users WHERE id = ${data.userId} FOR UPDATE`
      if (users.length === 0) {
        throw new ResourceNotFoundError('User not found.')
      }
      const leases = await transaction.$queryRaw<{ eventId: string }[]>`
        SELECT "eventId" FROM session_event_processings
        WHERE "eventId" = ${eventId}::uuid AND status = 'PROCESSING'
          AND "leaseToken" = ${leaseToken}::uuid AND "leaseUntil" > clock_timestamp()
        FOR UPDATE
      `
      if (leases.length === 0) {
        return 'waiting'
      }
      const { badges } = await makeUnlockAllBadgesUseCase(transaction).execute({
        userId: data.userId,
      })
      const snapshot = badges.map(
        ({ id, name, description, type, milestone, createdAt }) => ({
          id,
          name,
          description,
          type,
          milestone,
          createdAt: createdAt.toISOString(),
        })
      )
      const completed = await transaction.$executeRaw`
        UPDATE session_event_processings
        SET status = 'COMPLETED', "unlockedBadges" = ${JSON.stringify(snapshot)}::jsonb,
            "completedAt" = clock_timestamp(), "updatedAt" = clock_timestamp(),
            "leaseToken" = NULL, "leaseUntil" = NULL, "nextAttemptAt" = NULL, "lastError" = NULL
        WHERE "eventId" = ${eventId}::uuid AND "leaseUntil" > clock_timestamp()
      `
      if (completed !== 1) {
        throw new Error('Processing lease expired before completion')
      }
      return 'completed'
    })
  }

  private async recordFailure(
    eventId: string,
    token: string,
    outcome: 'waiting' | 'user_not_found' | 'attempts_exhausted'
  ) {
    const retry = outcome === 'waiting'
    const updated = await this.db.$executeRaw`
      UPDATE session_event_processings
      SET status = ${retry ? 'PENDING' : 'FAILED'}::"SessionEventProcessingStatus",
          "leaseToken" = NULL, "leaseUntil" = NULL, "updatedAt" = clock_timestamp(),
          "lastError" = ${retry ? 'processing_error' : outcome},
          "nextAttemptAt" = CASE WHEN ${retry}
            THEN clock_timestamp() + ${this.config.retryMs} * interval '1 millisecond' ELSE NULL END
      WHERE "eventId" = ${eventId}::uuid AND status = 'PROCESSING'
        AND "leaseToken" = ${token}::uuid AND "leaseUntil" > clock_timestamp()
    `
    if (updated !== 1) {
      return 'waiting'
    }
    return retry ? 'retry_scheduled' : outcome
  }
}
