import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteWorkoutController } from '../controllers/delete-workout.controller'
import { deleteWorkoutParamsSchema } from '../schemas/delete-workout.schema'

export function deleteWorkoutRoute(app: FastifyInstance) {
  app.delete(
    '/workouts/:workoutId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Delete workout',
        description: 'Deletes a workout owned by the authenticated user.',
        params: deleteWorkoutParamsSchema,
        response: {
          204: z.null().describe('Workout deleted successfully.'),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    deleteWorkoutController
  )
}
