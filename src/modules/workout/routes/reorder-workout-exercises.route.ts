import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { reorderWorkoutExercisesController } from '../controllers/reorder-workout-exercises.controller'
import {
  reorderWorkoutExercisesBodySchema,
  reorderWorkoutExercisesParamsSchema,
} from '../schemas/reorder-workout-exercises.schema'
import { workoutExerciseSchema } from '../schemas/workout.schema'

export function reorderWorkoutExercisesRoute(app: FastifyInstance) {
  app.put(
    '/workouts/:workoutId/exercises/reorder',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Reorder workout exercises',
        description:
          'Sets the order of every exercise in a workout. Include each current exercise ID exactly once.',
        params: reorderWorkoutExercisesParamsSchema,
        body: reorderWorkoutExercisesBodySchema,
        response: {
          200: z
            .object({
              exercises: z.array(
                workoutExerciseSchema.omit({ workoutId: true })
              ),
            })
            .describe('Workout exercises reordered successfully.'),
          400: z
            .object({ message: z.string() })
            .describe(
              'The submitted order does not contain every workout exercise exactly once.'
            ),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    reorderWorkoutExercisesController
  )
}
