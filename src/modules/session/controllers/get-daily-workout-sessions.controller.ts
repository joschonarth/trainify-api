import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetDailyWorkoutSessionUseCase } from '@/modules/session/use-cases/factories/make-get-daily-workout-sessions-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function getDailyWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const getDailyWorkoutSession = makeGetDailyWorkoutSessionUseCase()

    const { session } = await getDailyWorkoutSession.execute({
      userId: request.user.sub,
    })

    return reply.status(200).send({ session })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
