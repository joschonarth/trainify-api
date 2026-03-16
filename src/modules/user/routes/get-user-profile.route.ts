import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserProfileController } from '../controllers/get-user-profile.controller'

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
          200: {
            description: 'User profile returned successfully.',
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
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-15T10:30:00.000Z',
                  },
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid JWT token.',
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Unauthorized.' },
            },
          },
          404: {
            description: 'User not found.',
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Resource not found.' },
            },
          },
        },
      },
    },
    getUserProfileController
  )
}
