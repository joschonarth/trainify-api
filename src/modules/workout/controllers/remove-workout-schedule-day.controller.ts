import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeRemoveWorkoutScheduleDayUseCase } from '../use-cases/factories/make-remove-workout-schedule-day-use-case'

export async function removeWorkoutScheduleDayController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
    scheduleId: z.string(),
  })

  try {
    const { workoutId, scheduleId } = paramsSchema.parse(request.params)

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
