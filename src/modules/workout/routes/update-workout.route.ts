import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWorkoutController } from '../controllers/update-workout.controller'
import {
  updateWorkoutBodySchema,
  updateWorkoutParamsSchema,
} from '../schemas/update-workout.schema'
import { baseWorkoutSchema } from '../schemas/workout.schema'

export function updateWorkoutRoute(app: FastifyInstance) {
  app.put(
    '/workouts/:workoutId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Update workout',
        description:
          'Updates a workout owned by the authenticated user. All fields are optional — only provided fields will be updated.',
        params: updateWorkoutParamsSchema,
        body: updateWorkoutBodySchema,
        response: {
          200: z
            .object({
              workout: baseWorkoutSchema,
            })
            .describe('Workout updated successfully.'),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    updateWorkoutController
  )
}
