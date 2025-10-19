import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetWorkoutSessionsHistoryUseCase } from '@/modules/session/use-cases/factories/make-get-workout-sessions-history-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function getWorkoutSessionsHistoryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub

    const getWorkoutSessionsHistoryUseCase =
      makeGetWorkoutSessionsHistoryUseCase()

    const { sessions } = await getWorkoutSessionsHistoryUseCase.execute({
      userId,
    })

    return reply.status(200).send({ sessions })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
