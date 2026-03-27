import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { signOutController } from '../controllers/sign-out.controller'

export function signOutRoute(app: FastifyInstance) {
  app.post(
    '/logout',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Sign out',
        description:
          'Signs out the authenticated user by clearing the HTTP-only cookie.',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.null().describe('User signed out successfully.'),
          401: z
            .object({ message: z.string() })
            .describe('Missing or invalid JWT token.'),
        },
      },
    },
    signOutController
  )
}
