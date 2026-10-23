import type { FastifyReply, FastifyRequest } from 'fastify'
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

  const updateWeightLogUseCase = makeUpdateWeightLogUseCase()
  const updatedLog = await updateWeightLogUseCase.execute({
    logId,
    userId,
    weight,
    note,
  })

  return reply.status(200).send({ updatedLog })
}
