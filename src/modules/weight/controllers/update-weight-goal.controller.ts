import type { FastifyReply, FastifyRequest } from 'fastify'
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

  const updateWeightGoalUseCase = makeUpdateWeightGoalUseCase()

  const { weightGoal } = await updateWeightGoalUseCase.execute({
    goalId,
    userId,
    name,
    description: description ?? null,
    endDate: endDate ?? null,
  })

  return reply.status(200).send({ weightGoal })
}
