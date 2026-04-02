import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { CompareWorkoutsQuery } from '../schemas/compare-workouts.schema'
import { makeCompareWorkoutsUseCase } from '../use-cases/factories/make-compare-workouts-use-case'

export async function compareWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { period } = request.query as CompareWorkoutsQuery
  const userId = request.user.sub

  try {
    const compareWorkoutsUseCase = makeCompareWorkoutsUseCase()

    const result = await compareWorkoutsUseCase.execute({
      userId,
      period,
    })

    return reply.status(200).send({ result })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
