import { FastifyInstance } from 'fastify'

import { authenticateController } from '@/controllers/users/authenticate.controller'
import { fetchUserSchedulesController } from '@/controllers/users/fetch-user-schedules.controller'
import { profileController } from '@/controllers/users/profile.controller'
import { registerController } from '@/controllers/users/register.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', registerController)
  app.post('/sessions', authenticateController)

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, profileController)
  app.get(
    '/me/schedules',
    { onRequest: [verifyJwt] },
    fetchUserSchedulesController,
  )
}
