import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  UpdateWeightLogBody,
  UpdateWeightLogParams,
} from '../schemas/update-weight-log.schema'
import { makeUpdateWeightLogUseCase } from '../use-cases/factories/make-update-weight-log-use-case'

export async function updateWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { logId } = request.params as UpdateWeightLogParams
  const { weight, note } = request.body as UpdateWeightLogBody
  const userId = request.user.sub

  try {
    const updateWeightLogUseCase = makeUpdateWeightLogUseCase()
    const updatedLog = await updateWeightLogUseCase.execute({
      logId,
      userId,
      weight,
      note,
    })

    return reply.status(200).send({ updatedLog })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
