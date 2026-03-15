import type { FastifyInstance } from 'fastify'
import { authenticateRoute } from './authenticate.route'

export function usersRoutes(app: FastifyInstance) {
  app.register(authenticateRoute)
}
