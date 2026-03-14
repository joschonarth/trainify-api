import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetWeightLogUseCase } from '../use-cases/factories/make-get-weight-log-use-case'

export async function getWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const paramsSchema = z.object({
      logId: z.string(),
    })

    const userId = request.user.sub

    const { logId } = paramsSchema.parse(request.params)
    const getWeightLogUseCase = makeGetWeightLogUseCase()

    const log = await getWeightLogUseCase.execute({ logId, userId })

    return reply.status(200).send(log)
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
