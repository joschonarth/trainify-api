import { FastifyInstance } from 'fastify'

import { getUserStreakController } from '@/controllers/gamification/get-user-streak.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function gamificationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/streak', getUserStreakController)
}
