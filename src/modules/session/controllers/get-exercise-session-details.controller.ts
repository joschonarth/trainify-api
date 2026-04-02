import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetExerciseSessionDetailsUseCase } from '@/modules/session/use-cases/factories/make-get-exercise-session-details-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetExerciseSessionDetailsParams } from '../schemas/get-exercise-session-details.schema'

export async function getExerciseSessionDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { exerciseSessionId } =
    request.params as GetExerciseSessionDetailsParams

  try {
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
