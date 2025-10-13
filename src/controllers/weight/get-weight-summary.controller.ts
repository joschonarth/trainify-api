import { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeGetWeightSummaryUseCase } from '@/use-cases/weight/factories/make-get-weight-summary-use-case'

export async function getWeightSummaryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub
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
