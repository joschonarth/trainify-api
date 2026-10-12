import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { signOutController } from '../controllers/sign-out.controller'

export function signOutRoute(app: FastifyInstance) {
  app.post(
    '/logout',
    {
      schema: {
        tags: ['Users'],
        summary: 'Sign out',
        description:
          'Signs out the authenticated user by clearing the HTTP-only cookie.',
        response: {
          200: z.null().describe('User signed out successfully.'),
        },
      },
    },
    signOutController
  )
}
