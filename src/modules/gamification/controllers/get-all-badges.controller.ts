import { BadgeType } from '@prisma/client'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetAllBadgesUseCase } from '@/modules/gamification/use-cases/factories/make-get-all-badges-use-case'

const getAllBadgesQuerySchema = z.object({
  type: z.enum(BadgeType).optional().default(undefined),
  unlocked: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default(undefined),
})

export async function getAllBadgesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { type, unlocked } = getAllBadgesQuerySchema.parse(request.query)
  const userId = request.user?.sub

  const getAllBadgesUseCase = makeGetAllBadgesUseCase()

  const { badges } = await getAllBadgesUseCase.execute({
    userId,
    type,
    unlocked,
  })

  return reply.status(200).send({ badges })
}
