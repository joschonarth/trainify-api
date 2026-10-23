import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RemoveWorkoutScheduleDayParams } from '../schemas/remove-workout-schedule-day.schema'
import { makeRemoveWorkoutScheduleDayUseCase } from '../use-cases/factories/make-remove-workout-schedule-day-use-case'

export async function removeWorkoutScheduleDayController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId, scheduleId } =
    request.params as RemoveWorkoutScheduleDayParams
  const userId = request.user.sub

  const removeWorkoutScheduleDayUseCase = makeRemoveWorkoutScheduleDayUseCase()

  await removeWorkoutScheduleDayUseCase.execute({
    userId,
    workoutId,
    scheduleId,
  })

  return reply.status(204).send()
}
