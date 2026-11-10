import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RemoveExerciseFromLibraryParams } from '../schemas/remove-exercise-from-library.schema'
import { makeRemoveExerciseFromLibraryUseCase } from '../use-cases/factories/make-remove-exercise-from-library-use-case'

export async function removeExerciseFromLibraryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseId } = request.params as RemoveExerciseFromLibraryParams

  const removeExerciseFromLibraryUseCase =
    makeRemoveExerciseFromLibraryUseCase()

  await removeExerciseFromLibraryUseCase.execute({
    userId: request.user.sub,
    exerciseId,
  })

  return reply.status(204).send()
}
