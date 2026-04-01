import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { FetchWorkoutSchedulesParams } from '../schemas/fetch-workout-schedules.schema'
import { makeFetchWorkoutSchedulesUseCase } from '../use-cases/factories/make-fetch-workout-schedules-use-case'

export async function fetchWorkoutSchedulesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as FetchWorkoutSchedulesParams

  try {
    const fetchWorkoutSchedulesUseCase = makeFetchWorkoutSchedulesUseCase()
    const { schedules } = await fetchWorkoutSchedulesUseCase.execute({
      workoutId,
    })

    return reply.status(200).send({ schedules })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
