import { FastifyInstance } from 'fastify'

import { authenticate } from '@/controllers/authenticate.controller'
import { profile } from '@/controllers/profile.controller'
import { register } from '@/controllers/register.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, profile)
}
