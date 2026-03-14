import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import { makeCreateWeightLogUseCase } from '../use-cases/factories/make-create-weight-log-use-case'

export async function createWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const createWeightLogBodySchema = z.object({
    weight: z.number(),
    note: z.string().nullable().optional(),
  })

  try {
    const rawBody = createWeightLogBodySchema.parse(request.body)

    const weight = rawBody.weight
    const note = rawBody.note ?? null

    const userId = request.user.sub

    const createWeightLogUseCase = makeCreateWeightLogUseCase()

    const { weightLog } = await createWeightLogUseCase.execute({
      userId,
      weight,
      note,
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
