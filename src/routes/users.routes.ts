import { FastifyInstance } from 'fastify'

import { authenticateController } from '@/controllers/authenticate.controller'
import { profileController } from '@/controllers/profile.controller'
import { registerController } from '@/controllers/register.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', registerController)
  app.post('/sessions', authenticateController)

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, profileController)
}
