import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AddExerciseFromCatalogParams } from '../schemas/add-exercise-from-catalog.schema'
import { makeAddExerciseFromCatalog } from '../use-cases/factories/make-add-exercise-from-catalog-use-case'

export async function addExerciseFromCatalogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id: exerciseId } = request.params as AddExerciseFromCatalogParams

  const addExerciseFromCatalogUseCase = makeAddExerciseFromCatalog()

  const { myExercise } = await addExerciseFromCatalogUseCase.execute({
    userId: request.user.sub,
    exerciseId,
  })

  return reply.status(201).send({ myExercise })
}
