import { GoalType } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateWeightGoalUseCase } from '@/use-cases/weight/factories/make-create-weight-goal-use-case'

export async function createWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createGoalBodySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().nullable().default(null),
    goalType: z.enum(GoalType),
    startWeight: z.number(),
    targetWeight: z.number(),
    startDate: z.date().default(() => new Date()),
    endDate: z.date().nullable().default(null),
  })

  const parsedBody = createGoalBodySchema.parse(request.body)

  const {
    name,
    description,
    goalType,
    startWeight,
    targetWeight,
    startDate,
    endDate,
  } = parsedBody

  const userId = request.user.sub

  const createWeightGoalUseCase = makeCreateWeightGoalUseCase()

  const { weightGoal } = await createWeightGoalUseCase.execute({
    userId,
    name,
    description,
    goalType,
    startWeight,
    targetWeight,
    startDate,
    endDate,
  })

  return reply.status(201).send({ weightGoal })
}
