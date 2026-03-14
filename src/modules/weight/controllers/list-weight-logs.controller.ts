import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeListWeightLogsUseCase } from '../use-cases/factories/make-list-weight-logs-use-case'

export async function listWeightLogsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const listWeightLogsUseCase = makeListWeightLogsUseCase()

  const { weightLogs } = await listWeightLogsUseCase.execute({ userId })

  return reply.status(200).send({ weightLogs })
}
