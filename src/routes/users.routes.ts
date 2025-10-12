import { FastifyInstance } from 'fastify'

import { authenticateController } from '@/controllers/users/authenticate.controller'
import { changePasswordController } from '@/controllers/users/change-password.controller'
import { fetchUserSchedulesController } from '@/controllers/users/fetch-user-schedules.controller'
import { getUserProfileController } from '@/controllers/users/get-user-profile.controller'
import { registerController } from '@/controllers/users/register.controller'
import { signInWithGoogleController } from '@/controllers/users/sign-in-with-google.controller'
import { signOutController } from '@/controllers/users/sign-out.controller'
import { updateUserProfileController } from '@/controllers/users/update-user-profile.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', registerController)
  app.post('/sessions', authenticateController)

  /** Google Auth */
  app.post('/sessions/google', signInWithGoogleController)

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, getUserProfileController)
  app.put('/me', { onRequest: [verifyJwt] }, updateUserProfileController)
  app.get(
    '/me/schedules',
    { onRequest: [verifyJwt] },
    fetchUserSchedulesController,
  )

  app.post('/logout', { onRequest: [verifyJwt] }, signOutController)

  app.put('/me/password', { onRequest: [verifyJwt] }, changePasswordController)
}
