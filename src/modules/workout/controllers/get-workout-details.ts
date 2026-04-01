import type { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetWorkoutDetailsParams } from '../schemas/get-workout-details.schema'
import { makeGetWorkoutDetailsUseCase } from '../use-cases/factories/make-get-workout-details-use-case'

export async function getWorkoutDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { workoutId } = request.params as GetWorkoutDetailsParams

  try {
    const getWorkoutDetailsUseCase = makeGetWorkoutDetailsUseCase()

    const { workout } = await getWorkoutDetailsUseCase.execute({
      workoutId,
    })

    return reply.status(200).send({ workout })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
