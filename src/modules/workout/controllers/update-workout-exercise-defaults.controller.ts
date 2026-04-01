import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  UpdateWorkoutExerciseDefaultsBody,
  UpdateWorkoutExerciseDefaultsParams,
} from '../schemas/update-workout-exercise-defaults.schema'
import { makeUpdateWorkoutExerciseDefaultsUseCase } from '../use-cases/factories/make-update-workout-exercise-defaults-use-case'

export async function updateWorkoutExerciseDefaultsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { defaultSets, defaultReps, defaultWeight } =
    request.body as UpdateWorkoutExerciseDefaultsBody

  const { workoutId, exerciseId } =
    request.params as UpdateWorkoutExerciseDefaultsParams

  try {
    const updateWorkoutExerciseDefaultsUseCase =
      makeUpdateWorkoutExerciseDefaultsUseCase()

    const { workoutExercise } =
      await updateWorkoutExerciseDefaultsUseCase.execute({
        workoutId,
        exerciseId,
        defaultSets,
        defaultReps,
        defaultWeight,
      })

    return reply.status(200).send({ workoutExercise })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
