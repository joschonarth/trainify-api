import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateUserProfileController } from '../controllers/update-user-profile.controller'
import { updateUserProfileBodySchema } from '../schemas/update-user-profile.schema'

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
          200: z
            .object({
              id: z.string().describe('User ID.'),
              name: z.string().describe('User name.'),
              email: z.string().describe('User email.'),
              height: z
                .number()
                .nullable()
                .describe('User height in centimeters.'),
              weight: z
                .number()
                .nullable()
                .describe('User weight in kilograms.'),
              gender: z
                .enum(['male', 'female', 'other'])
                .nullable()
                .describe('User gender.'),
              birthdate: z.string().nullable().describe('User birthdate.'),
              createdAt: z.string().describe('Account creation date.'),
            })
            .describe('Profile updated successfully.'),
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
