import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetAllBadgesUseCase } from '@/modules/gamification/use-cases/factories/make-get-all-badges-use-case'
import type { GetAllBadgesQuery } from '../schemas/get-all-badges.schema'

export async function getAllBadgesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { type, unlocked } = request.query as GetAllBadgesQuery

  const userId = request.user?.sub

  const getAllBadgesUseCase = makeGetAllBadgesUseCase()

  const { badges } = await getAllBadgesUseCase.execute({
    userId,
    type: type ?? null,
    unlocked: unlocked ?? null,
  })

  return reply.status(200).send({ badges })
}
