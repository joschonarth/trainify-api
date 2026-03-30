import type { FastifyInstance } from 'fastify'
import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchExerciseLogsController } from '../controllers/fetch-exercise-logs.controller'

export function fetchExerciseLogsRoute(app: FastifyInstance) {
  app.get(
    '/exercise-logs',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercise Logs'],
        summary: 'Fetch exercise logs',
        description: 'Returns all exercise logs from the authenticated user.',
        response: {
          200: z
            .object({
              logs: z.array(
                z.object({
                  logId: z.string().describe('Log ID.'),
                  exerciseId: z.string().describe('Exercise ID.'),
                  name: z.string().describe('Exercise name.'),
                  category: z
                    .enum(ExerciseCategory)
                    .nullable()
                    .describe('Exercise category.'),
                  type: z
                    .enum(ExerciseType)
                    .nullable()
                    .describe('Exercise type.'),
                  sets: z.number().describe('Number of sets performed.'),
                  reps: z.number().describe('Number of reps performed.'),
                  weight: z
                    .number()
                    .nullable()
                    .describe('Weight used in kilograms.'),
                  description: z
                    .string()
                    .nullable()
                    .describe('Log notes or description.'),
                  date: z.date().describe('Date the log was recorded.'),
                })
              ),
            })
            .describe('Exercise logs fetched successfully.'),
        },
      },
    },
    fetchExerciseLogsController
  )
}
