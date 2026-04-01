import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { RemoveWorkoutScheduleDayParams } from '../schemas/remove-workout-schedule-day.schema'
import { makeRemoveWorkoutScheduleDayUseCase } from '../use-cases/factories/make-remove-workout-schedule-day-use-case'

export async function removeWorkoutScheduleDayController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId, scheduleId } =
    request.params as RemoveWorkoutScheduleDayParams

  try {
    const removeWorkoutScheduleDayUseCase =
      makeRemoveWorkoutScheduleDayUseCase()

    await removeWorkoutScheduleDayUseCase.execute({
      workoutId,
      scheduleId,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
