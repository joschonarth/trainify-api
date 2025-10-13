import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { InvalidWeightGoalError } from '@/errors/invalid-weight-goal.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeUpdateWeightGoalUseCase } from '@/use-cases/weight/factories/make-update-weight-goal-use-case'

export async function updateWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    goalId: z.string(),
  })

  const updateGoalBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    endDate: z.date().nullable().optional(),
  })

  try {
    const { goalId } = paramsSchema.parse(request.params)
    const data = updateGoalBodySchema.parse(request.body)

    const userId = request.user.sub

    const updateWeightGoalUseCase = makeUpdateWeightGoalUseCase()

    const { weightGoal } = await updateWeightGoalUseCase.execute({
      goalId,
      userId,
      name: data.name,
      description: data.description ?? null,
      endDate: data.endDate ?? null,
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
