import { FastifyInstance } from 'fastify'

import { getAllBadgesController } from '@/controllers/gamification/get-all-badges.controller'
import { getUserStreakController } from '@/controllers/gamification/get-user-streak.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function gamificationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  /** Streaks */
  app.get('/streak', getUserStreakController)

  /** Badges */
  app.get('/badges', getAllBadgesController)
}
