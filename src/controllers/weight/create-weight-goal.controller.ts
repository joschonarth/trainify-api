import { GoalType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateWeightGoalUseCase } from '@/use-cases/weight/factories/make-create-weight-goal-use-case'

export async function createWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createGoalBodySchema = z.object({
    goalType: z.enum(GoalType),
    startWeight: z.number(),
    targetWeight: z.number(),
    startDate: z.date().optional(),
    endDate: z.date().nullable().optional(),
  })

  const parsedBody = createGoalBodySchema.parse(request.body)

  const { goalType, startWeight, targetWeight } = parsedBody
  const startDate = parsedBody.startDate ?? new Date()
  const endDate = parsedBody.endDate ?? null

  const userId = request.user.sub

  const createWeightGoalUseCase = makeCreateWeightGoalUseCase()

  const { weightGoal } = await createWeightGoalUseCase.execute({
    userId,
    goalType,
    startWeight,
    targetWeight,
    startDate,
    endDate,
  })

  return reply.status(201).send({ weightGoal })
}
