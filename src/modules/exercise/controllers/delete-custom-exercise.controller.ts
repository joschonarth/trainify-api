import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeDeleteCustomExerciseUseCase } from '../use-cases/factories/make-delete-custom-exercise-use-case'

export async function deleteCustomExerciseController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    exerciseId: z.string(),
  })

  try {
    const { exerciseId } = paramsSchema.parse(request.params)

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
  }
}
