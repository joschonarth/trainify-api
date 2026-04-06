import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { DeleteWeightLogParams } from '../schemas/delete-weight-log.schema'
import { makeDeleteWeightLogUseCase } from '../use-cases/factories/make-delete-weight-log-use-case'

export async function deleteWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { logId } = request.params as DeleteWeightLogParams
  const userId = request.user.sub

  try {
    const deleteWeightLogUseCase = makeDeleteWeightLogUseCase()

    await deleteWeightLogUseCase.execute({ logId, userId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
