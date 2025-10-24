import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetWeightGoalLogsUseCase } from '../use-cases/factories/make-get-weight-goal-logs-use-case'

export async function getWeightGoalLogsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    goalId: z.string(),
  })

  const { goalId } = paramsSchema.parse(request.params)
  const userId = request.user.sub

  try {
    const getWeightGoalLogsUseCase = makeGetWeightGoalLogsUseCase()
    const { logs } = await getWeightGoalLogsUseCase.execute({
      goalId,
      userId,
    })

    return reply.status(200).send({ logs })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
