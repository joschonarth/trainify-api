import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  AssignDaysToWorkoutBody,
  AssignDaysToWorkoutParams,
} from '../schemas/assign-days-to-workout.schema'
import { makeAssignDaysToWorkoutUseCase } from '../use-cases/factories/make-assign-days-to-workout-use-case'

export async function assignDaysToWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as AssignDaysToWorkoutParams
  const { daysOfWeek } = request.body as AssignDaysToWorkoutBody

  const userId = request.user.sub

  const assignDaysToWorkoutUseCase = makeAssignDaysToWorkoutUseCase()
  const { assignedDays } = await assignDaysToWorkoutUseCase.execute({
    workoutId,
    daysOfWeek,
    userId,
  })

  return reply.status(200).send({ assignedDays })
}
