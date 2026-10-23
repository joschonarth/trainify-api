import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetWeightGoalParams } from '../schemas/get-weight-goal.schema'
import { makeGetWeightGoalUseCase } from '../use-cases/factories/make-get-weight-goal-use-case'

export async function getWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as GetWeightGoalParams
  const userId = request.user.sub

  const getWeightGoalUseCase = makeGetWeightGoalUseCase()
  const { weightGoal } = await getWeightGoalUseCase.execute({
    goalId,
    userId,
  })

  return reply.status(200).send({ weightGoal })
}
