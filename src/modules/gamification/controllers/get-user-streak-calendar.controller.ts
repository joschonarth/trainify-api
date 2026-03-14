import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetUserStreakCalendarUseCase } from '../use-cases/factories/make-get-user-streak-calendar-use-case'

export async function getUserStreakCalendarController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const querySchema = z.object({
    month: z.coerce
      .number()
      .min(1)
      .max(12)
      .optional()
      .default(new Date().getMonth() + 1),
    year: z.coerce
      .number()
      .min(1970)
      .max(2100)
      .optional()
      .default(new Date().getFullYear()),
  })

  const { month, year } = querySchema.parse(request.query)

  const getUserStreakCalendarUseCase = makeGetUserStreakCalendarUseCase()

  const { days } = await getUserStreakCalendarUseCase.execute({
    userId,
    month,
    year,
  })

  return reply.status(200).send({ days })
}
