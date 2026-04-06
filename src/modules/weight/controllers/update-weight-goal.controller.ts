import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import type {
  UpdateWeightGoalBody,
  UpdateWeightGoalParams,
} from '../schemas/update-weight-goal.schema'
import { makeUpdateWeightGoalUseCase } from '../use-cases/factories/make-update-weight-goal-use-case'

export async function updateWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as UpdateWeightGoalParams
  const { name, description, endDate } = request.body as UpdateWeightGoalBody

  const userId = request.user.sub

  try {
    const updateWeightGoalUseCase = makeUpdateWeightGoalUseCase()

    const { weightGoal } = await updateWeightGoalUseCase.execute({
      goalId,
      userId,
      name,
      description: description ?? null,
      endDate: endDate ?? null,
    })

    return reply.status(200).send({ weightGoal })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof InvalidWeightGoalError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
