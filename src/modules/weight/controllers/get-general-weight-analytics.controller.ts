import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetGeneralWeightAnalyticsQuery } from '../schemas/get-general-weight-analytics.schema'
import { makeGetGeneralWeightAnalyticsUseCase } from '../use-cases/factories/make-get-general-weight-analytics-use-case'

export async function getGeneralWeightAnalyticsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { from, to } = request.query as GetGeneralWeightAnalyticsQuery

  const userId = request.user.sub

  const getGeneralWeightAnalyticsUseCase =
    makeGetGeneralWeightAnalyticsUseCase()

  const payload: { userId: string; from?: Date; to?: Date } = { userId }

  if (from) {
    payload.from = from
  }

  if (to) {
    payload.to = to
  }

  const analytics = await getGeneralWeightAnalyticsUseCase.execute(payload)

  return reply.status(200).send({ analytics })
}
