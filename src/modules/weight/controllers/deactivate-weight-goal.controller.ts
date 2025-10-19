import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeDeactivateWeightGoalUseCase } from '../use-cases/factories/make-deactivate-weight-goal-use-case'

export async function deactivateWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramsSchema = z.object({
      goalId: z.string(),
    })
    const { goalId } = paramsSchema.parse(request.params)
    const userId = request.user.sub

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
