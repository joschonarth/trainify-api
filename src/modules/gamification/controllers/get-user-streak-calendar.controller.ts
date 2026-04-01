import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetUserStreakCalendarQuery } from '../schemas/get-user-streak-calendar.schema'
import { makeGetUserStreakCalendarUseCase } from '../use-cases/factories/make-get-user-streak-calendar-use-case'

export async function getUserStreakCalendarController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const { month, year } = request.query as GetUserStreakCalendarQuery

  const getUserStreakCalendarUseCase = makeGetUserStreakCalendarUseCase()

  const { days } = await getUserStreakCalendarUseCase.execute({
    userId,
    month,
    year,
  })

  return reply.status(200).send({ days })
}
