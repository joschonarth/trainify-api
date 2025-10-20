import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeAssignDaysToWorkoutUseCase } from '../use-cases/factories/make-assign-days-to-workout-use-case'

export async function assignDaysToWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    daysOfWeek: z.array(z.number().min(0).max(6)), // 0 = Sunday, 6 = Saturday
  })

  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  const { daysOfWeek } = bodySchema.parse(request.body)
  const { workoutId } = paramsSchema.parse(request.params)

  const assignDaysToWorkoutUseCase = makeAssignDaysToWorkoutUseCase()
  const { assignedDays } = await assignDaysToWorkoutUseCase.execute({
    workoutId,
    daysOfWeek,
  })

  return reply.status(200).send({ assignedDays })
}
