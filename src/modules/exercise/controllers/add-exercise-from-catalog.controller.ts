import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeAddExerciseFromCatalog } from '../use-cases/factories/make-add-exercise-from-catalog-use-case'

export async function addExerciseFromCatalogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.cuid(),
  })

  try {
    const { id: exerciseId } = paramsSchema.parse(request.params)

    const addExerciseFromCatalogUseCase = makeAddExerciseFromCatalog()

    const { myExercise } = await addExerciseFromCatalogUseCase.execute({
      userId: request.user.sub,
      exerciseId,
    })

    return reply.status(201).send({ myExercise })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
