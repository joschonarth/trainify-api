import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { exerciseSchema } from '@/modules/exercise/schemas/exercise.schema'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createOrAttachExerciseToWorkoutController } from '../controllers/create-or-attach-exercise-to-workout.controller'
import {
  createOrAttachExerciseToWorkoutBodySchema,
  createOrAttachExerciseToWorkoutParamsSchema,
} from '../schemas/create-or-attach-exercise-to-workout.schema'
import { workoutExerciseSchema } from '../schemas/workout.schema'

export function createOrAttachExerciseToWorkoutRoute(app: FastifyInstance) {
  app.post(
    '/workouts/:workoutId/exercises/create-or-attach',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Workouts'],
        summary: 'Create or attach exercise to workout',
        description:
          'Creates a custom exercise in the user library and attaches it to a workout, or attaches an existing active library exercise with the same name.',
        params: createOrAttachExerciseToWorkoutParamsSchema,
        body: createOrAttachExerciseToWorkoutBodySchema,
        response: {
          201: z
            .object({
              exercise: exerciseSchema,
              workoutExercise: workoutExerciseSchema.omit({ exercise: true }),
            })
            .describe('Exercise created and attached to workout successfully.'),
          404: z
            .object({ message: z.string() })
            .describe(
              'Workout not found or exercise is not in the active user library.'
            ),
          409: z
            .object({ message: z.string() })
            .describe('Exercise is already added to this workout.'),
        },
      },
    },
    createOrAttachExerciseToWorkoutController
  )
}
