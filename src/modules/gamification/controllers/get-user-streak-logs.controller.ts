import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetUserStreakLogsUseCase } from '../use-cases/factories/make-get-user-streak-logs-use-case'

export async function getUserStreakLogsController(
  request: FastifyRequest<{
    Querystring: { startDate?: string; endDate?: string }
  }>,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const querySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })

  const { startDate, endDate } = querySchema.parse(request.query)

  const getUserStreakLogsUseCase = makeGetUserStreakLogsUseCase()

  const requestPayload: { userId: string; startDate?: Date; endDate?: Date } = {
    userId,
  }

  if (startDate) {
    requestPayload.startDate = new Date(startDate)
  }
  if (endDate) {
    requestPayload.endDate = new Date(endDate)
  }

  const { logs } = await getUserStreakLogsUseCase.execute(requestPayload)

  return reply.status(200).send({ logs })
}
