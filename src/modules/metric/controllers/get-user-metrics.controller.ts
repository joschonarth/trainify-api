import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetUserMetricsUseCase } from '../use-cases/factories/make-get-user-metrics-use-case'

export async function getUserMetricsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const getUserMetricsUseCase = makeGetUserMetricsUseCase()
  const metrics = await getUserMetricsUseCase.execute({ userId })

  return reply.status(200).send({ metrics })
}
