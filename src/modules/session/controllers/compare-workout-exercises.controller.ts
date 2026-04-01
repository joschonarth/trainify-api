import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { CompareWorkoutExercisesParams } from '../schemas/compare-workout-exercises.schema'
import { makeCompareWorkoutExercisesUseCase } from '../use-cases/factories/make-compare-workout-exercises-use-case'

export async function compareWorkoutExercisesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as CompareWorkoutExercisesParams
  const userId = request.user.sub

  try {
    const compareWorkoutExercisesUseCase = makeCompareWorkoutExercisesUseCase()

    const result = await compareWorkoutExercisesUseCase.execute({
      userId,
      workoutId,
    })

    return reply.status(200).send({ result })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      })
    }

    throw error
  }
}
