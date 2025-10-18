import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { makeDeleteWeightLogUseCase } from '../use-cases/factories/make-delete-weight-log-use-case'

export async function deleteWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramsSchema = z.object({
      logId: z.string(),
    })

    const { logId } = paramsSchema.parse(request.params)
    const userId = request.user.sub

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
