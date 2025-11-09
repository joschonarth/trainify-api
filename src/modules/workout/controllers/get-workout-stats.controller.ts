import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetWorkoutStatsUseCase } from '../use-cases/factories/make-get-workout-stats-use-case'

export async function getWorkoutStatsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getWorkoutStatsParams = z.object({
    workoutId: z.cuid(),
  })

  const { workoutId } = getWorkoutStatsParams.parse(request.params)

  const userId = request.user.sub

  try {
    const getWorkoutStatsUseCase = makeGetWorkoutStatsUseCase()

    const stats = await getWorkoutStatsUseCase.execute({
      userId,
      workoutId,
    })

    return reply.status(200).send(stats)
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
