import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { compareWorkoutSessionsController } from '../controllers/compare-workout-sessions.controller'
import { compareWorkoutSessionsParamsSchema } from '../schemas/compare-workout-sessions.schema'

const sessionSummarySchema = z.object({
  id: z.string().describe('Session ID.'),
  date: z.string().describe('Session date.'),
  totalSets: z.number().describe('Total sets performed.'),
  totalReps: z.number().describe('Total reps performed.'),
  totalWeight: z.number().describe('Total weight used.'),
  totalVolume: z.number().describe('Total volume (sets * reps * weight).'),
  totalExercises: z.number().describe('Total exercises performed.'),
})

export function compareWorkoutSessionsRoute(app: FastifyInstance) {
  app.get(
    '/sessions/:workoutId/comparison',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Compare workout sessions',
        description:
          'Compares the last two workout sessions for a specific workout, returning performance differences.',
        params: compareWorkoutSessionsParamsSchema,
        response: {
          200: z
            .object({
              result: z.object({
                differenceInSets: z
                  .number()
                  .describe('Difference in total sets between sessions.'),
                differenceInReps: z
                  .number()
                  .describe('Difference in total reps between sessions.'),
                differenceInWeight: z
                  .number()
                  .describe('Difference in total weight between sessions.'),
                differenceInVolume: z
                  .number()
                  .describe('Difference in total volume between sessions.'),
                percentageVolumeChange: z
                  .number()
                  .describe('Percentage change in volume between sessions.'),
                lastSession: sessionSummarySchema.describe(
                  'Most recent session summary.'
                ),
                previousSession: sessionSummarySchema.describe(
                  'Previous session summary.'
                ),
              }),
            })
            .describe('Workout sessions comparison fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout or sessions not found.'),
        },
      },
    },
    compareWorkoutSessionsController
  )
}
