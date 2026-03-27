import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { registerController } from '@/modules/user/controllers/register.controller'
import { registerBodySchema } from '../schemas/register.schema'

export function registerRoute(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Register a new user',
        description: 'Creates a new user account and returns a JWT token.',
        body: registerBodySchema,
        response: {
          201: z
            .object({
              token: z
                .string()
                .describe('JWT token for the authenticated user.'),
            })
            .describe('User registered successfully.'),

          400: z
            .object({
              message: z.string(),
            })
            .describe('Passwords do not match.'),

          409: z
            .object({
              message: z.string(),
            })
            .describe('E-mail already in use.'),
        },
      },
    },
    registerController
  )
}
