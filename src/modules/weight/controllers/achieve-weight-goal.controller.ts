import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WeightGoalNotAchievedError } from '../errors/weight-goal-not-achieved.error'
import type { AchieveWeightGoalParams } from '../schemas/achieve-weight-goal.schema'
import { makeAchieveWeightGoalUseCase } from '../use-cases/factories/make-achieve-weight-goal-use-case'

export async function achieveWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as AchieveWeightGoalParams
  const userId = request.user.sub

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
