import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserStreakController } from '../controllers/get-user-streak.controller'

export function getUserStreakRoute(app: FastifyInstance) {
  app.get('/streak', { onRequest: [verifyJwt] }, getUserStreakController)
}
