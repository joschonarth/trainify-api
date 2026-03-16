import type { FastifyInstance } from 'fastify'
import { signInWithGoogleController } from '../controllers/sign-in-with-google.controller'

export function signInWithGoogleRoute(app: FastifyInstance) {
  app.post(
    '/auth/google',
    {
      schema: {
        tags: ['Users'],
        summary: 'Sign in with Google',
        description:
          'Authenticates a user using a Google OAuth token, returning user data and a JWT token and setting an HTTP-only cookie.',
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description:
                'Google OAuth ID token obtained from the Google Sign-In flow.',
              example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZjhhOD...',
            },
          },
        },
        response: {
          200: {
            description: 'User authenticated successfully.',
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'cm9x1k2j40000vk5yzq3h8p1a' },
                  name: { type: 'string', example: 'John Doe' },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  avatarUrl: {
                    type: 'string',
                    nullable: true,
                    example: 'https://lh3.googleusercontent.com/a/photo.jpg',
                  },
                },
              },
              token: {
                type: 'string',
                description: 'JWT token for the authenticated user.',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
          401: {
            description: 'Invalid or expired Google token.',
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Invalid Google token.' },
            },
          },
        },
      },
    },
    signInWithGoogleController
  )
}
