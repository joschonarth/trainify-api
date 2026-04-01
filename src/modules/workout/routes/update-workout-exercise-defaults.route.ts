import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateWorkoutExerciseDefaultsController } from '../controllers/update-workout-exercise-defaults.controller'
import {
  updateWorkoutExerciseDefaultsBodySchema,
  updateWorkoutExerciseDefaultsParamsSchema,
} from '../schemas/update-workout-exercise-defaults.schema'
import { workoutExerciseSchema } from '../schemas/workout.schema'

export function updateWorkoutExerciseDefaultsRoute(app: FastifyInstance) {
  app.put(
    '/workouts/:workoutId/exercises/:exerciseId',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Update workout exercise defaults',
        description:
          'Updates the default sets, reps and weight for an exercise in a specific workout.',
        params: updateWorkoutExerciseDefaultsParamsSchema,
        body: updateWorkoutExerciseDefaultsBodySchema,
        response: {
          200: z
            .object({
              workoutExercise: workoutExerciseSchema.omit({ exercise: true }),
            })
            .describe('Workout exercise defaults updated successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout or exercise not found.'),
        },
      },
    },
    updateWorkoutExerciseDefaultsController
  )
}
