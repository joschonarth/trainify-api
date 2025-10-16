import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetAllBadgesUseCase } from '@/use-cases/gamification/factories/make-get-all-badges-use-case'

export async function getAllBadgesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getAllBadgesUseCase = makeGetAllBadgesUseCase()

  const { badges } = await getAllBadgesUseCase.execute()

  return reply.status(200).send({ badges })
}
