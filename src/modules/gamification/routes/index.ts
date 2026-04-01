import type { FastifyInstance } from 'fastify'

import { getAllBadgesRoute } from './get-all-badges.route'
import { getBadgesStatsRoute } from './get-badges-stats.route'
import { getUnlockedBadgesRoute } from './get-unlocked-badges.route'
import { getUserStreakRoute } from './get-user-streak.route'
import { getUserStreakCalendarRoute } from './get-user-streak-calendar.route'
import { getUserStreakLogsRoute } from './get-user-streak-logs.route'
import { refreshUserStreakRoute } from './refresh-user-streak.route'

export function gamificationRoutes(app: FastifyInstance) {
  app.register(getUserStreakRoute)
  app.register(refreshUserStreakRoute)
  app.register(getUserStreakCalendarRoute)
  app.register(getUserStreakLogsRoute)
  app.register(getAllBadgesRoute)
  app.register(getUnlockedBadgesRoute)
  app.register(getBadgesStatsRoute)
}
