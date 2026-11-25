import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { markAllNotificationsReadController } from '../controllers/mark-all-notifications-read.controller'
import { notificationErrorSchema } from '../schemas/notification.schema'

export function markAllNotificationsReadRoute(app: FastifyInstance) {
  const routes = app.withTypeProvider<ZodTypeProvider>()
  routes.patch(
    '/notifications/read-all',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        description:
          'Marks unread notifications for the authenticated user. Cookie authentication requires an allowed origin.',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        response: {
          200: z.object({
            updatedCount: z
              .int()
              .nonnegative()
              .describe(
                'Number of notifications marked as read by this request.'
              ),
          }),
          401: notificationErrorSchema.describe(
            'Missing or invalid authentication token.'
          ),
          403: notificationErrorSchema.describe(
            'Invalid request origin for cookie authentication.'
          ),
        },
      },
    },
    markAllNotificationsReadController
  )
}
