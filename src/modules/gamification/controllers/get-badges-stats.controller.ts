import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetBadgesStatsUseCase } from '@/modules/gamification/use-cases/factories/make-get-badges-stats-use-case'

export async function getBadgesStatsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const getBadgesStatsUseCase = makeGetBadgesStatsUseCase()

  const stats = await getBadgesStatsUseCase.execute({ userId })

  return reply.status(200).send({ stats })
}
