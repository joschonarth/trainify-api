import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { changePasswordController } from '../controllers/change-password.controller'

export function changePasswordRoute(app: FastifyInstance) {
  app.put('/me/password', { onRequest: [verifyJwt] }, changePasswordController)
}
