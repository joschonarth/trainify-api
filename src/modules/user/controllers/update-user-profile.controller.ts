import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateUserProfileUseCase } from '@/modules/user/use-cases/factories/make-update-user-profile-use-case'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

export async function updateUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateProfileBodySchema = z.object({
    name: z.string().optional(),
    height: z.number().int().positive().optional(),
    weight: z.number().positive().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    birthdate: z.string().optional(),
  })

  const { name, height, weight, gender, birthdate } =
    updateProfileBodySchema.parse(request.body)

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
