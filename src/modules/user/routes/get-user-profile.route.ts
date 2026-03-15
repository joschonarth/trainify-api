import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getUserProfileController } from '../controllers/get-user-profile.controller'

export function getUserProfileRoute(app: FastifyInstance) {
  app.get('/me', { onRequest: [verifyJwt] }, getUserProfileController)
}
