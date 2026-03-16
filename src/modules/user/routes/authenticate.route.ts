import type { FastifyInstance } from 'fastify'
import { authenticateController } from '@/modules/user/controllers/authenticate.controller'

export function authenticateRoute(app: FastifyInstance) {
  app.post(
    '/auth',
    {
      schema: {
        tags: ['Users'],
        summary: 'Authenticate a user',
        description:
          'Authenticates a user with email and password, returning a JWT token and setting an HTTP-only cookie.',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: '123456',
            },
          },
        },
        response: {
          200: {
            description: 'User authenticated successfully.',
            type: 'object',
            properties: {
              token: {
                type: 'string',
                description: 'JWT token for the authenticated user.',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
          400: {
            description: 'Invalid credentials.',
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Invalid credentials.' },
            },
          },
        },
      },
    },
    authenticateController
  )
}
