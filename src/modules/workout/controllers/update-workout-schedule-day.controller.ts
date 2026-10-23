import type { FastifyReply, FastifyRequest } from 'fastify'
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
  const userId = request.user.sub

  const { newDayOfWeek } = request.body as UpdateWorkoutScheduleDayBody

  const updateWorkoutScheduleDayUseCase = makeUpdateWorkoutScheduleDayUseCase()
  const { schedule } = await updateWorkoutScheduleDayUseCase.execute({
    userId,
    workoutId,
    scheduleId,
    newDayOfWeek,
  })

  return reply.status(200).send({ schedule })
}
