import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type {
  UpdateWorkoutScheduleDayBody,
  UpdateWorkoutScheduleDayParams,
} from '../schemas/update-workout-schedule-day.schema'
import { makeUpdateWorkoutScheduleDayUseCase } from '../use-cases/factories/make-update-workout-schedule-day-use-case'

export async function updateWorkoutScheduleDayController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId, scheduleId } =
    request.params as UpdateWorkoutScheduleDayParams

  const { newDayOfWeek } = request.body as UpdateWorkoutScheduleDayBody

  try {
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
