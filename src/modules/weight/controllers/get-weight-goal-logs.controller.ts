import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetWeightGoalLogsParams } from '../schemas/get-weight-goal-logs.schema'
import { makeGetWeightGoalLogsUseCase } from '../use-cases/factories/make-get-weight-goal-logs-use-case'

export async function getWeightGoalLogsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as GetWeightGoalLogsParams
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
