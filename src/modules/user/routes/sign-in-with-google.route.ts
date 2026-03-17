import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { signInWithGoogleController } from '../controllers/sign-in-with-google.controller'
import { signInWithGoogleBodySchema } from '../schemas/sign-in-with-google.schema'

export function signInWithGoogleRoute(app: FastifyInstance) {
  app.post(
    '/auth/google',
    {
      schema: {
        tags: ['Users'],
        summary: 'Sign in with Google',
        description:
          'Authenticates a user using a Google OAuth token, returning user data and a JWT token and setting an HTTP-only cookie.',
        body: signInWithGoogleBodySchema,
        response: {
          200: z
            .object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.email(),
                avatarUrl: z.string().nullable(),
              }),
              token: z
                .string()
                .describe('JWT token for the authenticated user.'),
            })
            .describe('User authenticated successfully.'),
          401: z
            .object({ message: z.string() })
            .describe('Invalid or expired Google token.'),
        },
      },
    },
    signInWithGoogleController
  )
}
