import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticateController } from '@/modules/user/controllers/authenticate.controller'
import { authenticateBodySchema } from '../schemas/authenticate.schema'

export function authenticateRoute(app: FastifyInstance) {
  app.post(
    '/auth',
    {
      schema: {
        tags: ['Users'],
        summary: 'Authenticate a user',
        description:
          'Authenticates a user with email and password, returning a JWT token and setting an HTTP-only cookie.',
        body: authenticateBodySchema,
        response: {
          200: z
            .object({
              token: z
                .string()
                .describe('JWT token for the authenticated user.'),
            })
            .describe('User authenticated successfully.'),
          400: z
            .object({
              message: z.string(),
            })
            .describe('Invalid credentials.'),
        },
      },
    },
    authenticateController
  )
}
