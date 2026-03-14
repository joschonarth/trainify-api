import type { FastifyInstance } from 'fastify'

import { authenticateController } from '@/modules/user/controllers/authenticate.controller'
import { changePasswordController } from '@/modules/user/controllers/change-password.controller'
import { fetchUserSchedulesController } from '@/modules/user/controllers/fetch-user-schedules.controller'
import { getUserProfileController } from '@/modules/user/controllers/get-user-profile.controller'
import { registerController } from '@/modules/user/controllers/register.controller'
import { signInWithGoogleController } from '@/modules/user/controllers/sign-in-with-google.controller'
import { signOutController } from '@/modules/user/controllers/sign-out.controller'
import { updateUserProfileController } from '@/modules/user/controllers/update-user-profile.controller'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', registerController)
  app.post('/auth', authenticateController)

  /** Google Auth */
  app.post('/auth/google', signInWithGoogleController)

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, getUserProfileController)
  app.put('/me', { onRequest: [verifyJwt] }, updateUserProfileController)
  app.get(
    '/me/schedules',
    { onRequest: [verifyJwt] },
    fetchUserSchedulesController
  )

  app.post('/logout', { onRequest: [verifyJwt] }, signOutController)

  app.put('/me/password', { onRequest: [verifyJwt] }, changePasswordController)
}
