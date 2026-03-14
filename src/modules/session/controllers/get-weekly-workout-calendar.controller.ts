import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetWeeklyWorkoutCalendarUseCase } from '@/modules/session/use-cases/factories/make-get-weekly-workout-calendar-use-case'

export async function getWeeklyWorkoutCalendarController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.sub

  const getWeeklyWorkoutStatusUseCase = makeGetWeeklyWorkoutCalendarUseCase()
  const { week } = await getWeeklyWorkoutStatusUseCase.execute(userId)

  return reply.status(200).send({ week })
}
