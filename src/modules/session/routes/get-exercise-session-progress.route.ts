import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseSessionProgressController } from '../controllers/get-exercise-session-progress.controller'
import {
  getExerciseSessionProgressParamsSchema,
  getExerciseSessionProgressQuerySchema,
} from '../schemas/get-exercise-session-progress.schema'

export function getExerciseSessionProgressRoute(app: FastifyInstance) {
  app.get(
    '/sessions/exercises/:exerciseId/progress',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Sessions'],
        summary: 'Get exercise session progress',
        description:
          'Returns aggregated progress metrics and session history for a specific exercise. Supports filtering by period.',
        params: getExerciseSessionProgressParamsSchema,
        querystring: getExerciseSessionProgressQuerySchema,
        response: {
          200: z
            .object({
              exerciseId: z.string().describe('Exercise ID.'),
              exerciseName: z.string().describe('Exercise name.'),
              totalSessions: z.number().describe('Total number of sessions.'),
              totalVolume: z
                .number()
                .describe('Total volume across all sessions.'),
              avgVolume: z.number().describe('Average volume per session.'),
              maxVolume: z
                .number()
                .describe('Maximum volume in a single session.'),
              totalSets: z.number().describe('Total sets across all sessions.'),
              avgSets: z.number().describe('Average sets per session.'),
              maxSets: z.number().describe('Maximum sets in a single session.'),
              totalReps: z.number().describe('Total reps across all sessions.'),
              avgReps: z.number().describe('Average reps per session.'),
              maxReps: z.number().describe('Maximum reps in a single session.'),
              totalWeight: z
                .number()
                .describe('Total weight across all sessions.'),
              avgWeight: z.number().describe('Average weight per session.'),
              maxWeight: z
                .number()
                .describe('Maximum weight in a single session.'),
              totalDuration: z
                .number()
                .describe('Total duration across all sessions in seconds.'),
              avgDuration: z
                .number()
                .describe('Average duration per session in seconds.'),
              progress: z
                .array(
                  z.object({
                    sessionId: z.string().describe('Session ID.'),
                    date: z.date().nullable().describe('Session date.'),
                    duration: z
                      .number()
                      .describe('Session duration in seconds.'),
                    startedAt: z
                      .date()
                      .nullable()
                      .describe('Session start time.'),
                    endedAt: z.date().nullable().describe('Session end time.'),
                    totalVolume: z
                      .number()
                      .describe('Total volume for the session.'),
                    totalSets: z
                      .number()
                      .describe('Total sets for the session.'),
                    totalReps: z
                      .number()
                      .describe('Total reps for the session.'),
                    totalWeight: z
                      .number()
                      .describe('Total weight for the session.'),
                    logs: z.array(
                      z.object({
                        id: z.string().describe('Log ID.'),
                        sets: z.number().describe('Number of sets logged.'),
                        reps: z.number().describe('Number of reps logged.'),
                        weight: z
                          .number()
                          .nullable()
                          .describe('Weight logged in kilograms.'),
                        volume: z.number().describe('Volume for this log.'),
                        date: z.date().describe('Log date.'),
                        description: z
                          .string()
                          .nullable()
                          .describe('Log notes.'),
                      })
                    ),
                  })
                )
                .describe('Progress history per session.'),
            })
            .describe('Exercise session progress fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found.'),
        },
      },
    },
    getExerciseSessionProgressController
  )
}
