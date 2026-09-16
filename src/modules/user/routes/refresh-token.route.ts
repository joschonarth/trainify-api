import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { refreshTokenController } from '../controllers/refresh-token'

export function refreshTokenRoute(app: FastifyInstance) {
  app.patch(
    '/token/refresh',
    {
      schema: {
        tags: ['Users'],
        summary: 'Refresh the access token',
        description:
          'Uses the refresh token stored in the HTTP-only cookie to issue a new JWT token and rotate the refresh token.',
        response: {
          200: z
            .object({
              token: z.string().describe('New JWT token for the user.'),
            })
            .describe('Token refreshed successfully.'),
          401: z
            .object({
              message: z.string(),
            })
            .describe('Invalid or expired refresh token.'),
        },
      },
    },
    refreshTokenController
  )
}
