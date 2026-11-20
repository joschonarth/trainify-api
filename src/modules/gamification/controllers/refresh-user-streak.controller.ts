import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeRefreshUserStreakUseCase } from '../use-cases/factories/make-refresh-user-streak-use-case'

export async function refreshUserStreakController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub
  const refreshUserStreakUseCase = makeRefreshUserStreakUseCase()

  const streak = await refreshUserStreakUseCase.execute({
    userId,
  })

  return reply.status(200).send({ streak })
}
