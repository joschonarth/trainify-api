import type { FastifyInstance } from 'fastify'

import { getUserStreakRoute } from './get-user-streak.route'
import { getUserStreakCalendarRoute } from './get-user-streak-calendar.route'
import { getUserStreakLogsRoute } from './get-user-streak-logs.route'
import { refreshUserStreakRoute } from './refresh-user-streak.route'

export function streakRoutes(app: FastifyInstance) {
  app.register(getUserStreakRoute)
  app.register(refreshUserStreakRoute)
  app.register(getUserStreakCalendarRoute)
  app.register(getUserStreakLogsRoute)
}
