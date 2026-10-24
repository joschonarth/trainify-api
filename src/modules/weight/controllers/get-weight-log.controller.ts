import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetWeightLogParams } from '../schemas/get-weight-log.schema'
import { makeGetWeightLogUseCase } from '../use-cases/factories/make-get-weight-log-use-case'

export async function getWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const { logId } = request.params as GetWeightLogParams

  const getWeightLogUseCase = makeGetWeightLogUseCase()

  const log = await getWeightLogUseCase.execute({ logId, userId })

  return reply.status(200).send({ log })
}
