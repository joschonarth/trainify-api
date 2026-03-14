import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetActiveWeightGoalUseCase } from '../use-cases/factories/make-get-active-weight-goal-use-case'

export async function getActiveWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user.sub
    const getActiveWeightGoalUseCase = makeGetActiveWeightGoalUseCase()
    const activeGoal = await getActiveWeightGoalUseCase.execute(userId)

    return reply.status(200).send({ activeGoal })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    throw error
  }
}
