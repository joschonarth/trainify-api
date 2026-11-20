import type { FastifyReply, FastifyRequest } from 'fastify'

import type { ListWeightLogsQuery } from '../schemas/list-weight-logs.schema'
import { makeListWeightLogsUseCase } from '../use-cases/factories/make-list-weight-logs-use-case'

export async function listWeightLogsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub
  const { page, pageSize } = request.query as ListWeightLogsQuery

  const listWeightLogsUseCase = makeListWeightLogsUseCase()

  const { weightLogs, pagination } = await listWeightLogsUseCase.execute({
    userId,
    page,
    pageSize,
  })

  return reply.status(200).send({ weightLogs, pagination })
}
