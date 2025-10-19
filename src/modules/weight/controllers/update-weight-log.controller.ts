import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeUpdateWeightLogUseCase } from '../use-cases/factories/make-update-weight-log-use-case'

export async function updateWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramsSchema = z.object({
      logId: z.string(),
    })

    const bodySchema = z.object({
      weight: z.number().optional(),
      note: z.string().nullable().optional(),
    })

    const { logId } = paramsSchema.parse(request.params)
    const { weight, note } = bodySchema.parse(request.body)
    const userId = request.user.sub

    const updateWeightLogUseCase = makeUpdateWeightLogUseCase()
    const updatedLog = await updateWeightLogUseCase.execute({
      logId,
      userId,
      weight,
      note,
    })

    return reply.status(200).send(updatedLog)
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
