import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetWeightGoalUseCase } from '../use-cases/factories/make-get-weight-goal-use-case'

export async function getWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    goalId: z.string(),
  })

  const { goalId } = paramsSchema.parse(request.params)
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
