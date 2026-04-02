import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetWorkoutSessionDetailsUseCase } from '@/modules/session/use-cases/factories/make-get-workout-session-details-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { GetWorkoutSessionDetailsParams } from '../schemas/get-workout-session-details.schema'

export async function getWorkoutSessionDetailsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { sessionId } = request.params as GetWorkoutSessionDetailsParams

  try {
    const getWorkoutSessionDetailsUseCase =
      makeGetWorkoutSessionDetailsUseCase()

    const { session } = await getWorkoutSessionDetailsUseCase.execute({
      sessionId,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
