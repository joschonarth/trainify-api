import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { listNotificationsController } from '../controllers/list-notifications.controller'
import {
  notificationBadRequestSchema as badRequestSchema,
  notificationErrorSchema as errorSchema,
  listNotificationsQuerySchema,
  notificationPageSchema,
} from '../schemas/notification.schema'

export function listNotificationsRoute(app: FastifyInstance) {
  const security = [{ bearerAuth: [] }, { cookieAuth: [] }]
  const routes = app.withTypeProvider<ZodTypeProvider>()

  routes.get(
    '/notifications',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Notifications'],
        summary: 'List notifications',
        security,
        querystring: listNotificationsQuerySchema,
        response: {
          200: notificationPageSchema,
          400: badRequestSchema.describe(
            'Invalid page size, status or cursor.'
          ),
          401: errorSchema.describe('Missing or invalid authentication token.'),
        },
      },
    },
    listNotificationsController
  )
}
