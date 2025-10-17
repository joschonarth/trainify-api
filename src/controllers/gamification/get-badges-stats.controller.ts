import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetBadgesStatsUseCase } from '@/use-cases/gamification/factories/make-get-badges-stats-use-case'

export async function getBadgesStatsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub

    const getBadgesStatsUseCase = makeGetBadgesStatsUseCase()

    const stats = await getBadgesStatsUseCase.execute({ userId })

    return reply.status(200).send(stats)
  } catch (error) {
    console.error(error)
    return reply
      .status(500)
      .send({ message: 'Erro ao buscar estatísticas de badges' })
  }
}
