import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { changePasswordController } from '../controllers/change-password.controller'
import { changePasswordBodySchema } from '../schemas/change-password.schema'

export function changePasswordRoute(app: FastifyInstance) {
  app.put(
    '/me/password',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Change user password',
        description:
          'Changes the authenticated user password. Requires the current password and confirmation of the new password.',
        body: changePasswordBodySchema,
        response: {
          200: z.null().describe('Password changed successfully.'),
          400: z
            .object({ message: z.string() })
            .describe('Invalid current password or passwords do not match.'),
          404: z.object({ message: z.string() }).describe('User not found.'),
        },
      },
    },
    changePasswordController
  )
}
