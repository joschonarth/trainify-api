import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserProfileController } from '../controllers/get-user-profile.controller'
import { userProfileSchema } from '../schemas/user-profile.schema'

export function getUserProfileRoute(app: FastifyInstance) {
  app.get(
    '/me',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Get authenticated user profile',
        description:
          'Returns the profile data of the currently authenticated user. Requires a valid JWT token.',
        security: [{ bearerAuth: [] }],
        response: {
          200: z
            .object({
              user: userProfileSchema,
            })
            .describe('User profile returned successfully.'),
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid JWT token.'),
          404: z.object({ message: z.string() }).describe('User not found.'),
        },
      },
    },
    getUserProfileController
  )
}
