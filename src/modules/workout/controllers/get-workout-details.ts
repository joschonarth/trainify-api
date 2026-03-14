import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { makeGetWorkoutDetailsUseCase } from '../use-cases/factories/make-get-workout-details-use-case'

export async function getWorkoutDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    workoutId: z.string(),
  })

  try {
    const { workoutId } = paramsSchema.parse(request.params)
    const getWorkoutDetailsUseCase = makeGetWorkoutDetailsUseCase()

    const { workout } = await getWorkoutDetailsUseCase.execute({
      workoutId,
    })

    return reply.status(200).send({ workout })
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
