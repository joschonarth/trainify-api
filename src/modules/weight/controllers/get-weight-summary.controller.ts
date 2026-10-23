import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetWeightSummaryUseCase } from '../use-cases/factories/make-get-weight-summary-use-case'

export async function getWeightSummaryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const getWeightSummaryUseCase = makeGetWeightSummaryUseCase()
  const summary = await getWeightSummaryUseCase.execute(userId)

  return reply.status(200).send({ summary })
}
