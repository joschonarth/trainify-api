import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetActiveWeightGoalAnalyticsUseCase } from '../use-cases/factories/make-get-active-weight-goal-analytics-use-case'

export async function getActiveWeightGoalAnalyticsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const getActiveGoalAnalyticsUseCase =
    makeGetActiveWeightGoalAnalyticsUseCase()

  const analytics = await getActiveGoalAnalyticsUseCase.execute({ userId })

  return reply.status(200).send(analytics)
}
