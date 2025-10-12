import { FastifyReply, FastifyRequest } from 'fastify'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { makeFetchUserSchedulesUseCase } from '@/use-cases/users/factories/make-fetch-user-schedules-use-case'

export async function fetchUserSchedulesController(
  request: FastifyRequest,
  reply: FastifyReply,
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
