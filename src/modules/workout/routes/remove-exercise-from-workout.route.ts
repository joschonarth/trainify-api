import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { removeExerciseFromWorkoutController } from '../controllers/remove-exercise-from-workout.controller'
import { removeExerciseFromWorkoutParamsSchema } from '../schemas/remove-exercise-from-workout.schema'

export function removeExerciseFromWorkoutRoute(app: FastifyInstance) {
  app.delete(
    '/workouts/:workoutId/exercises/:exerciseId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Remove exercise from workout',
        description: 'Removes an exercise from a specific workout.',
        params: removeExerciseFromWorkoutParamsSchema,
        response: {
          204: z.null().describe('Exercise removed from workout successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout or exercise not found.'),
        },
      },
    },
    removeExerciseFromWorkoutController
  )
}
