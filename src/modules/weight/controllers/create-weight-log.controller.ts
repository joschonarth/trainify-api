import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateWeightLogBody } from '../schemas/create-weight-log.schema'
import { makeCreateWeightLogUseCase } from '../use-cases/factories/make-create-weight-log-use-case'

export async function createWeightLogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { weight, note } = request.body as CreateWeightLogBody

  const userId = request.user.sub

  const createWeightLogUseCase = makeCreateWeightLogUseCase()

  const { weightLog } = await createWeightLogUseCase.execute({
    userId,
    weight,
    note: note ?? null,
  })

  return reply.status(201).send({ weightLog })
}
