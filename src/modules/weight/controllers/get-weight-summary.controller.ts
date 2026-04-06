import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetWeightSummaryUseCase } from '../use-cases/factories/make-get-weight-summary-use-case'

export async function getWeightSummaryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  try {
    const getWeightSummaryUseCase = makeGetWeightSummaryUseCase()
    const summary = await getWeightSummaryUseCase.execute(userId)

    return reply.status(200).send({ summary })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    throw error
  }
}
