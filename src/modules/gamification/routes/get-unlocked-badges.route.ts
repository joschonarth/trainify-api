import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUnlockedBadgesController } from '../controllers/get-unlocked-badges.controller'

export function getUnlockedBadgesRoute(app: FastifyInstance) {
  app.get(
    '/badges/unlocked',
    { onRequest: [verifyJwt] },
    getUnlockedBadgesController
  )
}
