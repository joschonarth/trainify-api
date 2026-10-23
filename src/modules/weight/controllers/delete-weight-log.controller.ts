import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeleteWeightLogParams } from '../schemas/delete-weight-log.schema'
import { makeDeleteWeightLogUseCase } from '../use-cases/factories/make-delete-weight-log-use-case'

export async function deleteWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { logId } = request.params as DeleteWeightLogParams
  const userId = request.user.sub

  const deleteWeightLogUseCase = makeDeleteWeightLogUseCase()

  await deleteWeightLogUseCase.execute({ logId, userId })

  return reply.status(204).send()
}
