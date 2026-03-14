import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeFetchUserSchedulesUseCase } from '@/modules/user/use-cases/factories/make-fetch-user-schedules-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function fetchUserSchedulesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const fetchUserSchedules = makeFetchUserSchedulesUseCase()

    const { schedules } = await fetchUserSchedules.execute({
      userId: request.user.userId,
    })

    return reply.status(200).send({
      schedules,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}
