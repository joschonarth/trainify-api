import type { FastifyInstance } from 'fastify'

import { getAllBadgesRoute } from './get-all-badges.route'
import { getBadgesStatsRoute } from './get-badges-stats.route'
import { getUnlockedBadgesRoute } from './get-unlocked-badges.route'

export function badgeRoutes(app: FastifyInstance) {
  app.register(getAllBadgesRoute)
  app.register(getBadgesStatsRoute)
  app.register(getUnlockedBadgesRoute)
}
