import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeFetchWorkoutSchedulesUseCase } from '@/use-cases/workouts/factories/make-fetch-workout-schedules-use-case'

export async function fetchWorkoutSchedulesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  try {
    const { workoutId } = paramsSchema.parse(request.params)

    const useCase = makeFetchWorkoutSchedulesUseCase()
    const { schedules } = await useCase.execute({ workoutId })

    return reply.status(200).send({ schedules })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
