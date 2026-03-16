import type { FastifyInstance } from 'fastify'
import { registerController } from '@/modules/user/controllers/register.controller'

export function registerRoute(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Register a new user',
        description: 'Creates a new user account and returns a JWT token.',
        body: {
          type: 'object',
          required: ['name', 'email', 'password', 'passwordConfirmation'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
            },
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
            passwordConfirmation: {
              type: 'string',
              minLength: 6,
              example: '123456',
            },
          },
        },
        response: {
          201: {
            description: 'User registered successfully.',
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
            description: 'Passwords do not match.',
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Passwords do not match.' },
            },
          },
          409: {
            description: 'E-mail already in use.',
            type: 'object',
            properties: {
              message: { type: 'string', example: 'User already exists.' },
            },
          },
        },
      },
    },
    registerController
  )
}
