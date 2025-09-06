import { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeGetDailyWorkoutSessionUseCase } from '@/use-cases/workout-sessions/factories/make-get-daily-workout-sessions-use-case'

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
