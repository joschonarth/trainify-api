import { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WeightGoalNotAchievedError } from '@/modules/weight/errors/weight-goal-not-achieved.error'
import { makeAchieveWeightGoalUseCase } from '@/modules/weight/use-cases/factories/make-achieve-weight-goal-use-case'

export async function achieveWeightGoalController(
  request: FastifyRequest<{ Params: { goalId: string } }>,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const { goalId } = request.params

  try {
    const achieveWeightGoalUseCase = makeAchieveWeightGoalUseCase()

    const { weightGoal, progress } = await achieveWeightGoalUseCase.execute({
      userId,
      goalId,
    })

    return reply.status(200).send({ weightGoal, progress })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      })
    }

    if (error instanceof WeightGoalNotAchievedError) {
      return reply.status(400).send({
        message: error.message,
      })
    }

    throw error
  }
}
