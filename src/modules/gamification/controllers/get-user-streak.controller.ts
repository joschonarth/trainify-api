import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetUserStreakUseCase } from '@/modules/gamification/use-cases/factories/make-get-user-streak-use-case'

export async function getUserStreakController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub
  const getUserStreakUseCase = makeGetUserStreakUseCase()

  const streak = await getUserStreakUseCase.execute(userId)

  return reply.status(200).send({ streak })
}
