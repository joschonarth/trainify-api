import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { signOutController } from '../controllers/sign-out.controller'

export function signOutRoute(app: FastifyInstance) {
  app.post('/logout', { onRequest: [verifyJwt] }, signOutController)
}
