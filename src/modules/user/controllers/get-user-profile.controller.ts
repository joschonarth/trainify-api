import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetUserProfileUseCase } from '@/modules/user/use-cases/factories/make-get-user-profile-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function getUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const getUserProfile = makeGetUserProfileUseCase()

    const { user } = await getUserProfile.execute({
      userId: request.user.userId,
    })

    return reply.status(200).send({
      user: {
        ...user,
        password: undefined,
      },
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      })
    }

    throw error
  }
}
