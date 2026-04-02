import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetMonthlyWorkoutCalendarUseCase } from '@/modules/session/use-cases/factories/make-get-monthly-workout-calendar-use-case'
import type { GetMonthlyWorkoutCalendarQuery } from '../schemas/get-monthly-workout-calendar.schema'

export async function getMonthlyWorkoutCalendarController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub
  const { year, month } = request.query as GetMonthlyWorkoutCalendarQuery

  const getMonthlyWorkoutCalendarUseCase =
    makeGetMonthlyWorkoutCalendarUseCase()

  const { days } = await getMonthlyWorkoutCalendarUseCase.execute(
    userId,
    year,
    month ? month - 1 : undefined
  )

  return reply.status(200).send({ days })
}
