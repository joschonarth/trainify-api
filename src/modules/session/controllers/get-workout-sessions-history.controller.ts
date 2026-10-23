import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetWorkoutSessionsHistoryUseCase } from '@/modules/session/use-cases/factories/make-get-workout-sessions-history-use-case'

export async function getWorkoutSessionsHistoryController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const getWorkoutSessionsHistoryUseCase =
    makeGetWorkoutSessionsHistoryUseCase()

  const { sessions } = await getWorkoutSessionsHistoryUseCase.execute({
    userId,
  })

  return reply.status(200).send({ sessions })
}
