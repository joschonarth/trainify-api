import type { FastifyInstance } from 'fastify'
import { authenticateRoute } from './authenticate.route'
import { changePasswordRoute } from './change-password.route'
import { fetchUserSchedulesRoute } from './fetch-user-schedules.route'
import { getUserProfileRoute } from './get-user-profile.route'
import { registerRoute } from './register.route'
import { signInWithGoogleRoute } from './sign-in-with-google.route'
import { signOutRoute } from './sign-out.route'
import { updateUserProfileRoute } from './update-user-profile.route'

export function usersRoutes(app: FastifyInstance) {
  app.register(registerRoute)
  app.register(authenticateRoute)
  app.register(signInWithGoogleRoute)
  app.register(getUserProfileRoute)
  app.register(fetchUserSchedulesRoute)
  app.register(updateUserProfileRoute)
  app.register(changePasswordRoute)
  app.register(signOutRoute)
}
