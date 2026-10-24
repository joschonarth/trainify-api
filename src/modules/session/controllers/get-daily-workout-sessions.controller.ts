import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetDailyWorkoutSessionUseCase } from '@/modules/session/use-cases/factories/make-get-daily-workout-sessions-use-case'

export async function getDailyWorkoutSessionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const getDailyWorkoutSession = makeGetDailyWorkoutSessionUseCase()

  const { session } = await getDailyWorkoutSession.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ session })
}
