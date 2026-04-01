import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getBadgesStatsController } from '../controllers/get-badges-stats.controller'

export function getBadgesStatsRoute(app: FastifyInstance) {
  app.get('/badges/stats', { onRequest: [verifyJwt] }, getBadgesStatsController)
}
