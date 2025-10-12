import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeLogWeightUseCase } from '@/use-cases/weight/factories/make-log-weight-use-case'
import { LogWeightUseCase } from '@/use-cases/weight/log-weight.use-case'

export async function logWeightController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const logWeightBodySchema = z.object({
    weight: z.number(),
    note: z.string().nullable().optional(),
    goalId: z.string().nullable().optional(),
  })

  const rawBody = logWeightBodySchema.parse(request.body)

  const weight = rawBody.weight
  const note = rawBody.note ?? null
  const goalId = rawBody.goalId ?? null

  const userId = request.user.sub

  const logWeightUseCase: LogWeightUseCase = makeLogWeightUseCase()

  const { weightLog } = await logWeightUseCase.execute({
    userId,
    weight,
    note,
    goalId,
  })

  return reply.status(201).send({ weightLog })
}
