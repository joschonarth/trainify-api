import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ListWeightGoalsQuery } from '../schemas/list-weight-goals.schema'
import { makeListWeightGoalsUseCase } from '../use-cases/factories/make-list-weight-goals-use-case'

export async function listWeightGoalsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { status } = request.query as ListWeightGoalsQuery
  const userId = request.user.sub

  const listWeightGoalsUseCase = makeListWeightGoalsUseCase()

  const { weightGoals } = await listWeightGoalsUseCase.execute({
    userId,
    ...(status && { status }),
  })

  return reply.status(200).send({ weightGoals })
}
