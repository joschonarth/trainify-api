import type { FastifyInstance } from 'fastify'
import { ExerciseCategory } from 'generated/prisma'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseLogController } from '../controllers/get-exercise-log.controller'
import { exerciseLogSchema } from '../schemas/exercise-log.schema'
import { getExerciseLogParamsSchema } from '../schemas/get-exercise-log.schema'

export function getExerciseLogRoute(app: FastifyInstance) {
  app.get(
    '/exercise-logs/:id',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Exercise Logs'],
        summary: 'Get exercise log',
        description: 'Returns the details of a specific exercise log by ID.',
        params: getExerciseLogParamsSchema,
        response: {
          200: z
            .object({
              log: exerciseLogSchema.extend({
                exercise: z.object({
                  id: z.string().describe('Exercise ID.'),
                  name: z.string().describe('Exercise name.'),
                  category: z
                    .enum(ExerciseCategory)
                    .nullable()
                    .describe('Exercise category.'),
                  type: z.string().nullable().describe('Exercise type.'),
                }),
              }),
            })
            .describe('Exercise log fetched successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Exercise log not found.'),
        },
      },
    },
    getExerciseLogController
  )
}
