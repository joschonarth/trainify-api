import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetUserStreakLogsQuery } from '../schemas/get-user-streak-logs.schema'
import { makeGetUserStreakLogsUseCase } from '../use-cases/factories/make-get-user-streak-logs-use-case'

export async function getUserStreakLogsController(
  request: FastifyRequest<{
    Querystring: { startDate?: string; endDate?: string }
  }>,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const { startDate, endDate } = request.query as GetUserStreakLogsQuery

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
