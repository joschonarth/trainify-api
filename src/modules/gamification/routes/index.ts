import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { getAllBadgesController } from '../controllers/get-all-badges.controller'
import { getBadgesStatsController } from '../controllers/get-badges-stats.controller'
import { getUnlockedBadgesController } from '../controllers/get-unlocked-badges.controller'
import { getUserStreakController } from '../controllers/get-user-streak.controller'
import { getUserStreakCalendarController } from '../controllers/get-user-streak-calendar.controller'
import { getUserStreakLogsController } from '../controllers/get-user-streak-logs.controller'
import { refreshUserStreakController } from '../controllers/refresh-user-streak.controller'

export async function gamificationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  /** Streaks */
  app.get('/streak', getUserStreakController)
  app.get('/streak/refresh', refreshUserStreakController)
  app.get('/streak/calendar', getUserStreakCalendarController)
  app.get('/streak/logs', getUserStreakLogsController)

  /** Badges */
  app.get('/badges', getAllBadgesController)
  app.get('/badges/unlocked', getUnlockedBadgesController)
  app.get('/badges/stats', getBadgesStatsController)
}
