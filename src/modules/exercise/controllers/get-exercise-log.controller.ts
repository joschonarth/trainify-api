import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetExerciseLogParams } from '../schemas/get-exercise-log.schema'
import { makeGetExerciseLogUseCase } from '../use-cases/factories/make-get-exercise-log-use-case'

export async function getExerciseLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as GetExerciseLogParams

  try {
    const getExerciseLogUseCase = makeGetExerciseLogUseCase()
    const { log } = await getExerciseLogUseCase.execute({ logId: id })

    return reply.status(200).send({ log })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
