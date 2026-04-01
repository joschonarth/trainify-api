import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { RemoveExerciseFromWorkoutParams } from '../schemas/remove-exercise-from-workout.schema'
import { makeRemoveExerciseFromWorkoutUseCase } from '../use-cases/factories/make-remove-exercise-from-workout-use-case'

export async function removeExerciseFromWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId, exerciseId } =
    request.params as RemoveExerciseFromWorkoutParams

  try {
    const removeExerciseFromWorkoutUseCase =
      makeRemoveExerciseFromWorkoutUseCase()

    await removeExerciseFromWorkoutUseCase.execute({ workoutId, exerciseId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
