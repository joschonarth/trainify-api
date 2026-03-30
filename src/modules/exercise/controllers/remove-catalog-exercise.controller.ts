import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { RemoveCatalogExerciseParams } from '../schemas/remove-catalog-exercise.schema'
import { makeRemoveCatalogExerciseUseCase } from '../use-cases/factories/make-remove-catalog-exercise-use-case'

export async function removeCatalogExerciseController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as RemoveCatalogExerciseParams

  try {
    const removeCatalogExerciseUseCase = makeRemoveCatalogExerciseUseCase()

    await removeCatalogExerciseUseCase.execute({
      userId: request.user.sub,
      myExerciseId: id,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
