import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeleteWeightGoalParams } from '../schemas/delete-weight-goal.schema'
import { makeDeleteWeightGoalUseCase } from '../use-cases/factories/make-delete-weight-goal-use-case'

export async function deleteWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { goalId } = request.params as DeleteWeightGoalParams
  const userId = request.user.sub

  const deleteWeightGoalUseCase = makeDeleteWeightGoalUseCase()
  await deleteWeightGoalUseCase.execute({ goalId, userId })

  return reply.status(204).send()
}
