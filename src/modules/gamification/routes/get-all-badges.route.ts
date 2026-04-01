import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getAllBadgesController } from '../controllers/get-all-badges.controller'

export function getAllBadgesRoute(app: FastifyInstance) {
  app.get('/badges', { onRequest: [verifyJwt] }, getAllBadgesController)
}
