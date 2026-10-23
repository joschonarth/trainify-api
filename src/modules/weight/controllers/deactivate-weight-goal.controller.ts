import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeactivateWeightGoalParams } from '../schemas/deactivate-weight-goal.schema'
import { makeDeactivateWeightGoalUseCase } from '../use-cases/factories/make-deactivate-weight-goal-use-case'

export async function deactivateWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as DeactivateWeightGoalParams
  const userId = request.user.sub

  const deactivateGoalUseCase = makeDeactivateWeightGoalUseCase()
  await deactivateGoalUseCase.execute({ goalId, userId })

  return reply.status(204).send()
}
