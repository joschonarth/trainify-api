import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AchieveWeightGoalParams } from '../schemas/achieve-weight-goal.schema'
import { makeAchieveWeightGoalUseCase } from '../use-cases/factories/make-achieve-weight-goal-use-case'

export async function achieveWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as AchieveWeightGoalParams
  const userId = request.user.sub

  const achieveWeightGoalUseCase = makeAchieveWeightGoalUseCase()

  const { weightGoal, progress } = await achieveWeightGoalUseCase.execute({
    userId,
    goalId,
  })

  return reply.status(200).send({ weightGoal, progress })
}
