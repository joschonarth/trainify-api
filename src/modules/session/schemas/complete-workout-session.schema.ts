import { z } from 'zod'
import { sessionGamificationSchema } from '../events/workout-finalized-v1'
import { sessionWithWorkoutSchema } from './workout-session.schema'

export const completeWorkoutSessionResponseSchema = z.object({
  session: sessionWithWorkoutSchema.nullable(),
  gamification: sessionGamificationSchema.describe(
    'Durable processing identity and current status. Fetch rewards through GET /gamification/processings/{processingId}.'
  ),
})

export type CompleteWorkoutSessionResponse = z.infer<
  typeof completeWorkoutSessionResponseSchema
>

export const completeWorkoutSessionParamsSchema = z.object({
  sessionId: z.cuid(),
})

export const completeWorkoutSessionBodySchema = z.object({
  exercises: z
    .array(
      z.object({
        exerciseSessionId: z.cuid(),
        sets: z.number().int().min(1, 'Sets must be at least 1'),
        reps: z
          .number()
          .int()
          .min(1, 'Reps must be at least 1')
          .describe(
            'Repetitions per set for REPS; positive integer seconds per set for DURATION. Reported execution comes from the payload, not the timer.'
          ),
        weight: z.number().min(0).optional().default(0),
        completed: z.boolean(),
        note: z.string().optional(),
        skipReason: z.string().trim().max(255).optional(),
      })
    )
    .min(1, 'At least one exercise is required')
    .superRefine((exercises, context) => {
      exercises.forEach((exercise, index) => {
        if (exercise.completed && exercise.skipReason !== undefined) {
          context.addIssue({
            code: 'custom',
            message:
              'Skip reason can only be provided for uncompleted exercises.',
            path: [index, 'skipReason'],
          })
        }
      })
    }),
})

export type CompleteWorkoutSessionParams = z.infer<
  typeof completeWorkoutSessionParamsSchema
>
export type CompleteWorkoutSessionBody = z.infer<
  typeof completeWorkoutSessionBodySchema
>
