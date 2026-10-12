import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchUserSchedulesUseCase } from '@/modules/user/use-cases/factories/make-fetch-user-schedules-use-case'

export async function fetchUserSchedulesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const fetchUserSchedules = makeFetchUserSchedulesUseCase()

  const { schedules } = await fetchUserSchedules.execute({
    userId: request.user.sub,
  })

  return reply.status(200).send({ schedules })
}
