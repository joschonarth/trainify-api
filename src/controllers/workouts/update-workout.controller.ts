import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeUpdateWorkoutUseCase } from '@/use-cases/workouts/factories/make-update-workout-use-case'

export async function updateWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  const bodySchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable(),
  })

  try {
    const { workoutId } = paramsSchema.parse(request.params)
    const { name, description } = bodySchema.parse(request.body)

    const useCase = makeUpdateWorkoutUseCase()
    const { workout } = await useCase.execute({
      workoutId,
      name,
      description,
    })

    return reply.status(200).send({ workout })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
