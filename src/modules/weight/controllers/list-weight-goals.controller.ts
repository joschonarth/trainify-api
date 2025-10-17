import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeListWeightGoalsUseCase } from '@/modules/weight/use-cases/factories/make-list-weight-goals-use-case'

export async function listWeightGoalsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    status: z.enum(['active', 'completed']).optional(),
  })

  const { status } = querySchema.parse(request.query)

  const userId = request.user.sub

  const listWeightGoalsUseCase = makeListWeightGoalsUseCase()

  const { weightGoals } = await listWeightGoalsUseCase.execute({
    userId,
    ...(status && { status }),
  })

  return reply.status(200).send({ weightGoals })
}
