import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { InvalidWeightGoalError } from '@/modules/weight/errors/invalid-weight-goal.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeLogWeightUseCase } from '@/modules/weight/use-cases/factories/make-log-weight-use-case'

export async function logWeightController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const logWeightBodySchema = z.object({
    weight: z.number(),
    note: z.string().nullable().optional(),
    goalId: z.string().nullable().optional(),
  })

  try {
    const rawBody = logWeightBodySchema.parse(request.body)

    const weight = rawBody.weight
    const note = rawBody.note ?? null
    const goalId = rawBody.goalId ?? null

    const userId = request.user.sub

    const logWeightUseCase = makeLogWeightUseCase()

    const { weightLog } = await logWeightUseCase.execute({
      userId,
      weight,
      note,
      goalId,
    })

    return reply.status(201).send({ weightLog })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      })
    }

    if (error instanceof InvalidWeightGoalError) {
      return reply.status(400).send({
        message: error.message,
      })
    }

    throw error
  }
}
