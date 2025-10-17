import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/middlewares/verify-jwt'
import { getAllBadgesController } from '@/modules/gamification/controllers/get-all-badges.controller'
import { getBadgesStatsController } from '@/modules/gamification/controllers/get-badges-stats.controller'
import { getUnlockedBadgesController } from '@/modules/gamification/controllers/get-unlocked-badges.controller'
import { getUserStreakController } from '@/modules/gamification/controllers/get-user-streak.controller'

export async function gamificationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  /** Streaks */
  app.get('/streak', getUserStreakController)

  /** Badges */
  app.get('/badges', getAllBadgesController)
  app.get('/badges/unlocked', getUnlockedBadgesController)
  app.get('/badges/stats', getBadgesStatsController)
}
