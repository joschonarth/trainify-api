import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateWeightGoalBody } from '../schemas/create-weight-goal.schema'
import { makeCreateWeightGoalUseCase } from '../use-cases/factories/make-create-weight-goal-use-case'

export async function createWeightGoalController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, description, goalType, targetWeight, startDate, endDate } =
    request.body as CreateWeightGoalBody

  const userId = request.user.sub

  const createWeightGoalUseCase = makeCreateWeightGoalUseCase()

  const { weightGoal } = await createWeightGoalUseCase.execute({
    userId,
    name,
    description,
    goalType,
    targetWeight,
    startDate,
    endDate,
  })

  return reply.status(201).send({ weightGoal })
}
