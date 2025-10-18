import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetActiveGoalWeightAnalyticsUseCase } from '../use-cases/factories/make-get-active-goal-weight-analytics-use-case'

export async function getActiveGoalWeightAnalyticsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub

  const getActiveGoalAnalyticsUseCase =
    makeGetActiveGoalWeightAnalyticsUseCase()

  const analytics = await getActiveGoalAnalyticsUseCase.execute({ userId })

  return reply.status(200).send(analytics)
}
