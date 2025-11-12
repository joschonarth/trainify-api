import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeCompareWorkoutsUseCase } from '../use-cases/factories/make-compare-workouts-use-case'

export async function compareWorkoutsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const compareQuerySchema = z.object({
    period: z.enum(['week', 'month']).optional().default('week'),
  })

  const { period } = compareQuerySchema.parse(request.query)
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
