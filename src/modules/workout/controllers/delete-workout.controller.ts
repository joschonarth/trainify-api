import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { DeleteWorkoutParams } from '../schemas/delete-workout.schema'
import { makeDeleteWorkoutUseCase } from '../use-cases/factories/make-delete-workout-use-case'

export async function deleteWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as DeleteWorkoutParams

  try {
    const deleteWorkoutUseCase = makeDeleteWorkoutUseCase()
    await deleteWorkoutUseCase.execute({ workoutId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
