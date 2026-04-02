import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { DeactivateWeightGoalParams } from '../schemas/deactivate-weight-goal.schema'
import { makeDeactivateWeightGoalUseCase } from '../use-cases/factories/make-deactivate-weight-goal-use-case'

export async function deactivateWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as DeactivateWeightGoalParams
  const userId = request.user.sub

  try {
    const deactivateGoalUseCase = makeDeactivateWeightGoalUseCase()
    await deactivateGoalUseCase.execute({ goalId, userId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
