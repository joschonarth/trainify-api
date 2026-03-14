import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeCompareWeeklyWorkoutsUseCase } from '../use-cases/factories/make-compare-weekly-workouts-use-case'

export async function compareWeeklyWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  try {
    const compareWeeklyUseCase = makeCompareWeeklyWorkoutsUseCase()
    const result = await compareWeeklyUseCase.execute({ userId })

    return reply.status(200).send({ result })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
