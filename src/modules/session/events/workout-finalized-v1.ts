import { z } from 'zod'

export const WORKOUT_FINALIZED_V1 = 'session.workout-finalized.v1'

export const workoutFinalizedV1Schema = z.strictObject({
  eventId: z.uuid(),
  type: z.literal(WORKOUT_FINALIZED_V1),
  occurredAt: z.iso.datetime(),
  correlationId: z.uuid(),
  data: z.strictObject({
    sessionId: z.string().min(1),
    userId: z.string().min(1),
    status: z.enum(['COMPLETED', 'INCOMPLETE', 'SKIPPED']),
    hasActivity: z.boolean(),
    completedAt: z.iso.datetime(),
    businessDate: z.iso.date(),
    timezone: z.string().min(1),
  }),
})

export type WorkoutFinalizedV1 = z.infer<typeof workoutFinalizedV1Schema>

export interface SessionEventOutboxRepository {
  create(event: WorkoutFinalizedV1): Promise<void>
}

export const sessionGamificationSchema = z.object({
  processingId: z.uuid(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
})

export type SessionGamification = z.infer<typeof sessionGamificationSchema>

export interface SessionEventProcessingRepository {
  createPending(identity: {
    eventId: string
    sessionId: string
    userId: string
  }): Promise<SessionGamification>
  findBySessionId(
    sessionId: string,
    userId: string
  ): Promise<SessionGamification | null>
}
