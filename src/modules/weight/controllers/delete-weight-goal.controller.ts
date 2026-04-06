import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { DeleteWeightGoalParams } from '../schemas/delete-weight-goal.schema'
import { makeDeleteWeightGoalUseCase } from '../use-cases/factories/make-delete-weight-goal-use-case'

export async function deleteWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as DeleteWeightGoalParams
  const userId = request.user.sub

  try {
    const deleteWeightGoalUseCase = makeDeleteWeightGoalUseCase()
    await deleteWeightGoalUseCase.execute({ goalId, userId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
