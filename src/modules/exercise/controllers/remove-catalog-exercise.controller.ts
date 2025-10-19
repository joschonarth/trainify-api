import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { makeRemoveCatalogExerciseUseCase } from '../use-cases/factories/make-remove-catalog-exercise-use-case'

export async function removeCatalogExerciseController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  })

  try {
    const { id } = paramsSchema.parse(request.params)
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
