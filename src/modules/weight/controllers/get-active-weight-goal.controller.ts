import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetActiveWeightGoalUseCase } from '../use-cases/factories/make-get-active-weight-goal-use-case'

export async function getActiveWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const getActiveWeightGoalUseCase = makeGetActiveWeightGoalUseCase()
  const activeGoal = await getActiveWeightGoalUseCase.execute(userId)

  return reply.status(200).send({ activeGoal })
}
