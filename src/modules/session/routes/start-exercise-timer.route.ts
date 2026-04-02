import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { startExerciseTimerController } from '../controllers/start-exercise-timer.controller'
import { startExerciseTimerParamsSchema } from '../schemas/start-exercise-timer.schema'

const exerciseSessionSchema = z.object({
  id: z.string().describe('Exercise session ID.'),
  startedAt: z.date().nullable().describe('Exercise session start time.'),
  endedAt: z.date().nullable().describe('Exercise session end time.'),
  duration: z
    .number()
    .nullable()
    .describe('Exercise session duration in seconds.'),
  completed: z
    .boolean()
    .describe('Whether the exercise session was completed.'),
  plannedSets: z.number().nullable().describe('Planned number of sets.'),
  plannedReps: z.number().nullable().describe('Planned number of reps.'),
  plannedWeight: z.number().nullable().describe('Planned weight in kilograms.'),
  workoutSessionId: z.string().describe('Workout session ID.'),
  exerciseId: z.string().describe('Exercise ID.'),
})

export function startExerciseTimerRoute(app: FastifyInstance) {
  app.post(
    '/sessions/exercises/:exerciseSessionId/start',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Start exercise timer',
        description: 'Starts the timer for a specific exercise session.',
        params: startExerciseTimerParamsSchema,
        response: {
          200: z
            .object({
              exerciseSession: exerciseSessionSchema,
            })
            .describe('Exercise timer started successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise session not found.'),
          409: z
            .object({ message: z.string() })
            .describe(
              'Exercise timer is already running or another exercise timer is running.'
            ),
        },
      },
    },
    startExerciseTimerController
  )
}
