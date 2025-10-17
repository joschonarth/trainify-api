import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetUnlockedBadgesUseCase } from '@/use-cases/gamification/factories/make-get-unlocked-badges-use-case'

export async function getUnlockedBadgesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub

  const getUnlockedBadgesUseCase = makeGetUnlockedBadgesUseCase()

  const { badges } = await getUnlockedBadgesUseCase.execute({ userId })

  return reply.status(200).send({ badges })
}
