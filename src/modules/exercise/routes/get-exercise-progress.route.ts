import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseProgressController } from '../controllers/get-exercise-progress.controller'
import { getExerciseProgressParamsSchema } from '../schemas/get-exercise-progress.schema'

export function getExerciseProgressRoute(app: FastifyInstance) {
  app.get(
    '/exercises/:exerciseId/progress',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercises'],
        summary: 'Get exercise progress',
        description:
          'Returns progress metrics and historical logs for a specific exercise of the authenticated user.',
        params: getExerciseProgressParamsSchema,
        response: {
          200: z
            .object({
              exerciseId: z.string().describe('Exercise ID.'),
              exerciseName: z.string().nullable().describe('Exercise name.'),
              totalLogs: z.number().describe('Total number of logs recorded.'),
              totalVolume: z
                .number()
                .describe('Sum of all volumes across logs.'),
              avgVolume: z.number().describe('Average volume per log.'),
              maxVolume: z
                .number()
                .describe('Highest volume recorded in a single log.'),
              maxVolumeDate: z
                .date()
                .nullable()
                .describe('Date when the highest volume was recorded.'),
              progress: z
                .array(
                  z.object({
                    date: z.string().describe('Log date.'),
                    weight: z.number().describe('Weight used in kilograms.'),
                    reps: z.number().describe('Number of reps performed.'),
                    sets: z.number().describe('Number of sets performed.'),
                    volume: z
                      .number()
                      .describe('Volume for this log (sets * reps * weight).'),
                  })
                )
                .describe('Historical progress entries.'),
            })
            .describe('Exercise progress fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise not found.'),
        },
      },
    },
    getExerciseProgressController
  )
}
