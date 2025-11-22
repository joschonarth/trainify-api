import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetExerciseSessionDetailsUseCase } from '@/modules/session/use-cases/factories/make-get-exercise-session-details-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function getExerciseSessionDetailsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    exerciseSessionId: z.string(),
  })

  try {
    const { exerciseSessionId } = paramsSchema.parse(request.params)

    const getExerciseSessionDetailsUseCase =
      makeGetExerciseSessionDetailsUseCase()

    const { session } = await getExerciseSessionDetailsUseCase.execute({
      exerciseSessionId,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
