import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeleteCustomExerciseParams } from '../schemas/delete-custom-exercise.schema'
import { makeDeleteCustomExerciseUseCase } from '../use-cases/factories/make-delete-custom-exercise-use-case'

export async function deleteCustomExerciseController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseId } = request.params as DeleteCustomExerciseParams

  const deleteCustomExerciseUseCase = makeDeleteCustomExerciseUseCase()

  await deleteCustomExerciseUseCase.execute({
    userId: request.user.sub,
    exerciseId,
  })

  return reply.status(204).send()
}
