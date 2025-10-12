import { FastifyReply, FastifyRequest } from 'fastify'

import { makeListWeightGoalsUseCase } from '@/use-cases/weight/factories/make-list-weight-goals-use-case'

export async function listWeightGoalsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub

  const listWeightGoalsUseCase = makeListWeightGoalsUseCase()

  const { weightGoals } = await listWeightGoalsUseCase.execute({
    userId,
  })

  return reply.status(200).send({ weightGoals })
}
