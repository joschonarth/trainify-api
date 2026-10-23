import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetWorkoutStatsParams } from '../schemas/get-workout-stats.schema'
import { makeGetWorkoutStatsUseCase } from '../use-cases/factories/make-get-workout-stats-use-case'

export async function getWorkoutStatsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as GetWorkoutStatsParams

  const userId = request.user.sub

  const getWorkoutStatsUseCase = makeGetWorkoutStatsUseCase()

  const stats = await getWorkoutStatsUseCase.execute({
    userId,
    workoutId,
  })

  return reply.status(200).send(stats)
}
