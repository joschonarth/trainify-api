import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateUserProfileController } from '../controllers/update-user-profile.controller'
import { updateUserProfileBodySchema } from '../schemas/update-user-profile.schema'
import { userProfileSchema } from '../schemas/user-profile.schema'

export function updateUserProfileRoute(app: FastifyInstance) {
  app.put(
    '/me',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Update user profile',
        description:
          'Updates the authenticated user profile data. All fields are optional — only provided fields will be updated.',
        body: updateUserProfileBodySchema,
        response: {
          200: userProfileSchema.describe('Profile updated successfully.'),
          404: z
            .object({
              message: z.string(),
            })
            .describe('User not found.'),
        },
      },
    },
    updateUserProfileController
  )
}
