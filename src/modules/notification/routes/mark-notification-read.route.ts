import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { markNotificationReadController } from '../controllers/mark-notification-read.controller'
import {
  notificationBadRequestSchema as badRequestSchema,
  notificationErrorSchema as errorSchema,
  notificationParamsSchema,
  notificationSchema,
} from '../schemas/notification.schema'

export function markNotificationReadRoute(app: FastifyInstance) {
  const security = [{ bearerAuth: [] }, { cookieAuth: [] }]
  const routes = app.withTypeProvider<ZodTypeProvider>()

  routes.patch(
    '/notifications/:notificationId/read',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        description:
          'Returns the notification with the time it was first read. Cookie authentication requires an allowed origin.',
        security,
        params: notificationParamsSchema,
        response: {
          200: notificationSchema.extend({ readAt: z.iso.datetime() }),
          400: badRequestSchema.describe('Invalid notification ID.'),
          401: errorSchema.describe('Missing or invalid authentication token.'),
          403: errorSchema.describe(
            'Invalid request origin for cookie authentication.'
          ),
          404: errorSchema.describe('Notification not found.'),
        },
      },
    },
    markNotificationReadController
  )
}
