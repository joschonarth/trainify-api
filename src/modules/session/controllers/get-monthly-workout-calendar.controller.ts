import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetMonthlyWorkoutCalendarUseCase } from '@/modules/session/use-cases/factories/make-get-monthly-workout-calendar-use-case'

export async function getMonthlyWorkoutCalendarController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.sub
  const { year, month } = request.query as { year?: string; month?: string }

  const getMonthlyWorkoutCalendarUseCase =
    makeGetMonthlyWorkoutCalendarUseCase()

  const { days } = await getMonthlyWorkoutCalendarUseCase.execute(
    userId,
    year ? Number(year) : undefined,
    month ? Number(month) - 1 : undefined,
  )

  return reply.status(200).send({ days })
}
