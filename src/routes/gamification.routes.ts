import { FastifyInstance } from 'fastify'

import { getAllBadgesController } from '@/controllers/gamification/get-all-badges.controller'
import { getBadgesStatsController } from '@/controllers/gamification/get-badges-stats.controller'
import { getUnlockedBadgesController } from '@/controllers/gamification/get-unlocked-badges.controller'
import { getUserStreakController } from '@/controllers/gamification/get-user-streak.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function gamificationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  /** Streaks */
  app.get('/streak', getUserStreakController)

  /** Badges */
  app.get('/badges', getAllBadgesController)
  app.get('/badges/unlocked', getUnlockedBadgesController)
  app.get('/badges/stats', getBadgesStatsController)
}
