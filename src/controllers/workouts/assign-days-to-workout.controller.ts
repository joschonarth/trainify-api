import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceAlreadyExistsError } from '@/errors/resource-already-exists.error'
import { makeAssignDaysToWorkoutUseCase } from '@/use-cases/workouts/factories/make-assign-days-to-workout-use-case'

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

  try {
    const { daysOfWeek } = bodySchema.parse(request.body)
    const { workoutId } = paramsSchema.parse(request.params)

    const useCase = makeAssignDaysToWorkoutUseCase()
    const { days } = await useCase.execute({ workoutId, daysOfWeek })

    return reply.status(201).send({ assignedDays: days })
  } catch (error) {
    if (error instanceof ResourceAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
