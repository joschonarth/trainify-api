import type { FastifyReply, FastifyRequest } from 'fastify'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetExerciseDetailsParams } from '../schemas/get-exercise-details.schema'
import { makeGetExerciseDetailsUseCase } from '../use-cases/factories/make-get-exercise-details-use-case'

export async function getExerciseDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as GetExerciseDetailsParams

  try {
    const getExerciseDetailsUseCase = makeGetExerciseDetailsUseCase()

    const { exercise } = await getExerciseDetailsUseCase.execute({
      exerciseId: id,
      userId: request.user.sub,
    })

    return reply.status(200).send({ exercise })
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
