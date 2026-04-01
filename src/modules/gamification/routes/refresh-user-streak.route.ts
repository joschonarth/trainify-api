import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { refreshUserStreakController } from '../controllers/refresh-user-streak.controller'

export function refreshUserStreakRoute(app: FastifyInstance) {
  app.get(
    '/streak/refresh',
    { onRequest: [verifyJwt] },
    refreshUserStreakController
  )
}
