import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeDeleteWorkoutUseCase } from '../use-cases/factories/make-delete-workout-use-case'

export async function deleteWorkoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  try {
    const { workoutId } = paramsSchema.parse(request.params)

    const deleteWorkoutUseCase = makeDeleteWorkoutUseCase()
    await deleteWorkoutUseCase.execute({ workoutId })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
