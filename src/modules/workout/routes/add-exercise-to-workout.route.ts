import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { addExerciseToWorkoutController } from '../controllers/add-exercise-to-workout.controller'
import {
  addExerciseToWorkoutBodySchema,
  addExerciseToWorkoutParamsSchema,
} from '../schemas/add-exercise-to-workout.schema'
import { workoutExerciseSchema } from '../schemas/workout.schema'

export function addExerciseToWorkoutRoute(app: FastifyInstance) {
  app.post(
    '/workouts/:workoutId/exercises',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Add exercise to workout',
        description:
          'Adds an exercise to a specific workout with optional default sets, reps and weight.',
        params: addExerciseToWorkoutParamsSchema,
        body: addExerciseToWorkoutBodySchema,
        response: {
          201: z
            .object({
              workoutExercise: workoutExerciseSchema.omit({ exercise: true }),
            })
            .describe('Exercise added to workout successfully.'),
          404: z
            .object({ message: z.string() })
            .describe('Workout or exercise not found.'),
          409: z
            .object({ message: z.string() })
            .describe('Exercise already added to this workout.'),
        },
      },
    },
    addExerciseToWorkoutController
  )
}
