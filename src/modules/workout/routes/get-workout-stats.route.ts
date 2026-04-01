import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getWorkoutStatsController } from '../controllers/get-workout-stats.controller'
import { getWorkoutStatsParamsSchema } from '../schemas/get-workout-stats.schema'

const sessionSchema = z.object({
  id: z.string().describe('Session ID.'),
  date: z.string().describe('Session date.'),
  totalExercises: z
    .number()
    .describe('Total exercises performed in the session.'),
  totalVolume: z.number().describe('Total volume in the session.'),
})

export function getWorkoutStatsRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/stats',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Get workout stats',
        description:
          'Returns aggregated statistics for a specific workout, including total sessions, volume, and session history.',
        params: getWorkoutStatsParamsSchema,
        response: {
          200: z
            .object({
              workoutId: z.string().describe('Workout ID.'),
              workout: z.string().describe('Workout name.'),
              totalSessions: z
                .number()
                .describe('Total number of sessions performed.'),
              totalExercises: z
                .number()
                .describe(
                  'Total number of exercises performed across all sessions.'
                ),
              totalVolume: z
                .number()
                .describe('Sum of all volumes across all sessions.'),
              avgVolume: z.number().describe('Average volume per session.'),
              highestVolumeSession: sessionSchema.describe(
                'Session with the highest volume.'
              ),
              sessions: z
                .array(sessionSchema)
                .describe('List of all sessions.'),
            })
            .describe('Workout stats fetched successfully.'),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    getWorkoutStatsController
  )
}
