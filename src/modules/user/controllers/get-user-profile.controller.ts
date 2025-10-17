import { FastifyReply, FastifyRequest } from 'fastify'

import { makeGetUserProfileUseCase } from '@/modules/user/use-cases/factories/make-get-user-profile-use-case'

export async function getUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
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
}
