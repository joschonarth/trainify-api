import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetWorkoutStatsParams } from '../schemas/get-workout-stats.schema'
import { makeGetWorkoutStatsUseCase } from '../use-cases/factories/make-get-workout-stats-use-case'

export async function getWorkoutStatsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as GetWorkoutStatsParams

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
