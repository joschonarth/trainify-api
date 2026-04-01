import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetWorkoutCalendarUseCase } from '@/modules/session/use-cases/factories/make-get-workout-calendar-use-case'
import type { GetWorkoutCalendarQuery } from '../schemas/get-workout-calendar.schema'

export async function getWorkoutCalendarController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const { month, year } = request.query as GetWorkoutCalendarQuery

  const getWorkoutCalendarUseCase = makeGetWorkoutCalendarUseCase()

  const { days } = await getWorkoutCalendarUseCase.execute({
    userId,
    month,
    year,
  })

  return reply.status(200).send({ days })
}
