import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeUpdateWorkoutScheduleDayUseCase } from '../use-cases/factories/make-update-workout-schedule-day-use-case'

export async function updateWorkoutScheduleDayController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const bodySchema = z.object({
    newDayOfWeek: z.number().min(0).max(6),
  })

  const paramsSchema = z.object({
    workoutId: z.string(),
    scheduleId: z.string(),
  })

  try {
    const { newDayOfWeek } = bodySchema.parse(request.body)
    const { workoutId, scheduleId } = paramsSchema.parse(request.params)

    const updateWorkoutScheduleDayUseCase =
      makeUpdateWorkoutScheduleDayUseCase()
    const { schedule } = await updateWorkoutScheduleDayUseCase.execute({
      workoutId,
      scheduleId,
      newDayOfWeek,
    })

    return reply.status(200).send({ schedule })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
