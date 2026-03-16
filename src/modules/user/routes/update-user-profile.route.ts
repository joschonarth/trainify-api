import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { updateUserProfileController } from '../controllers/update-user-profile.controller'

export function updateUserProfileRoute(app: FastifyInstance) {
  app.put('/me', { onRequest: [verifyJwt] }, updateUserProfileController)
}
