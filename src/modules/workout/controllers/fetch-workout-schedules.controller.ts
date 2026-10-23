import type { FastifyReply, FastifyRequest } from 'fastify'
import type { FetchWorkoutSchedulesParams } from '../schemas/fetch-workout-schedules.schema'
import { makeFetchWorkoutSchedulesUseCase } from '../use-cases/factories/make-fetch-workout-schedules-use-case'

export async function fetchWorkoutSchedulesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as FetchWorkoutSchedulesParams
  const userId = request.user.sub

  const fetchWorkoutSchedulesUseCase = makeFetchWorkoutSchedulesUseCase()
  const { schedules } = await fetchWorkoutSchedulesUseCase.execute({
    workoutId,
    userId,
  })

  return reply.status(200).send({ schedules })
}
