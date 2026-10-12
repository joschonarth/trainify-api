import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeUpdateUserProfileUseCase } from '@/modules/user/use-cases/factories/make-update-user-profile-use-case'
import type { UpdateUserProfileBody } from '../schemas/update-user-profile.schema'

export async function updateUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, height, weight, gender, birthdate } =
    request.body as UpdateUserProfileBody

  const updateUserProfile = makeUpdateUserProfileUseCase()

  const { user } = await updateUserProfile.execute({
    userId: request.user.sub,
    ...(name !== undefined && { name }),
    ...(height !== undefined && { height }),
    ...(weight !== undefined && { weight }),
    ...(gender !== undefined && { gender }),
    ...(birthdate !== undefined && { birthdate: new Date(birthdate) }),
  })

  return reply.status(200).send({
    ...user,
    birthdate: user.birthdate?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    password: undefined,
  })
}
