import type { FastifyInstance } from 'fastify'
import { listNotificationsRoute } from './list-notifications.route'
import { markAllNotificationsReadRoute } from './mark-all-notifications-read.route'
import { markNotificationReadRoute } from './mark-notification-read.route'

export function notificationsRoutes(app: FastifyInstance) {
  app.register(listNotificationsRoute)
  app.register(markAllNotificationsReadRoute)
  app.register(markNotificationReadRoute)
}
