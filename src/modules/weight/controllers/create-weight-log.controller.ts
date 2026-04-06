import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { InvalidWeightGoalError } from '../errors/invalid-weight-goal.error'
import type { CreateWeightLogBody } from '../schemas/create-weight-log.schema'
import { makeCreateWeightLogUseCase } from '../use-cases/factories/make-create-weight-log-use-case'

export async function createWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { weight, note } = request.body as CreateWeightLogBody

  const userId = request.user.sub

  try {
    const createWeightLogUseCase = makeCreateWeightLogUseCase()

    const { weightLog } = await createWeightLogUseCase.execute({
      userId,
      weight,
      note: note ?? null,
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
