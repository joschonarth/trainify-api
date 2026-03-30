import type { FastifyReply, FastifyRequest } from 'fastify'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { DeleteCustomExerciseParams } from '../schemas/delete-custom-exercise.schema'
import { makeDeleteCustomExerciseUseCase } from '../use-cases/factories/make-delete-custom-exercise-use-case'

export async function deleteCustomExerciseController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseId } = request.params as DeleteCustomExerciseParams

  try {
    const deleteCustomExerciseUseCase = makeDeleteCustomExerciseUseCase()

    await deleteCustomExerciseUseCase.execute({
      userId: request.user.sub,
      exerciseId,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof NotAllowedError) {
      return reply.status(403).send({ message: error.message })
    }

    throw error
  }
}
