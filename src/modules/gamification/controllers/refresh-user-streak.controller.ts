import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeUpdateUserStreakUseCase } from '../use-cases/factories/make-update-user-streak-use-case'

export async function refreshUserStreakController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub
  const updateUserStreakUseCase = makeUpdateUserStreakUseCase()

  const streak = await updateUserStreakUseCase.execute({
    userId,
    logDate: new Date(),
    isRefresh: true,
  })

  return reply.status(200).send({ streak })
}
