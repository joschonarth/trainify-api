import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeCompareMonthlyWorkoutsUseCase } from '../use-cases/factories/make-compare-monthly-workouts-use-case'

export async function compareMonthlyWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  try {
    const compareMonthlyUseCase = makeCompareMonthlyWorkoutsUseCase()
    const result = await compareMonthlyUseCase.execute({ userId })

    return reply.status(200).send({ result })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
