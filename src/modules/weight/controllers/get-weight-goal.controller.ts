import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetWeightGoalParams } from '../schemas/get-weight-goal.schema'
import { makeGetWeightGoalUseCase } from '../use-cases/factories/make-get-weight-goal-use-case'

export async function getWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as GetWeightGoalParams
  const userId = request.user.sub

  try {
    const getWeightGoalUseCase = makeGetWeightGoalUseCase()
    const { weightGoal } = await getWeightGoalUseCase.execute({
      goalId,
      userId,
    })

    return reply.status(200).send({ weightGoal })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
