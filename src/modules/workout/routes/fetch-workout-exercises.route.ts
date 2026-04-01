import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchWorkoutExercisesController } from '../controllers/fetch-workout-exercises.controller'
import { fetchWorkoutExercisesParamsSchema } from '../schemas/fetch-workout-exercises.schema'
import { workoutExerciseSchema } from '../schemas/workout.schema'

export function fetchWorkoutExercisesRoute(app: FastifyInstance) {
  app.get(
    '/workouts/:workoutId/exercises',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Fetch workout exercises',
        description:
          'Returns all exercises associated with a specific workout.',
        params: fetchWorkoutExercisesParamsSchema,
        response: {
          200: z
            .object({
              exercises: z.array(
                workoutExerciseSchema.omit({ workoutId: true })
              ),
            })
            .describe('Workout exercises fetched successfully.'),
          404: z.object({ message: z.string() }).describe('Workout not found.'),
        },
      },
    },
    fetchWorkoutExercisesController
  )
}
