import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeUpdateUserProfileUseCase } from '@/modules/user/use-cases/factories/make-update-user-profile-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { UpdateUserProfileBody } from '../schemas/update-user-profile.schema'

export async function updateUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, height, weight, gender, birthdate } =
    request.body as UpdateUserProfileBody

  try {
    const updateUserProfile = makeUpdateUserProfileUseCase()

    const { user } = await updateUserProfile.execute({
      userId: request.user.userId,
      ...(name !== undefined && { name }),
      ...(height !== undefined && { height }),
      ...(weight !== undefined && { weight }),
      ...(gender !== undefined && { gender }),
      ...(birthdate !== undefined && { birthdate: new Date(birthdate) }),
    })

    return reply.status(200).send({
      ...user,
      password: undefined,
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
