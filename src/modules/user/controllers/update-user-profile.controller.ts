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
    age: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    weight: z.number().positive().optional(),
  })

  const { name, age, height, weight } = updateProfileBodySchema.parse(
    request.body,
  )

  try {
    const updateUserProfile = makeUpdateUserProfileUseCase()

    const { user } = await updateUserProfile.execute({
      userId: request.user.userId,
      ...(name !== undefined && { name }),
      ...(age !== undefined && { age }),
      ...(height !== undefined && { height }),
      ...(weight !== undefined && { weight }),
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
