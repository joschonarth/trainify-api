import type { FastifyInstance } from 'fastify'
import { authenticateController } from '@/modules/user/controllers/authenticate.controller'

export function authenticateRoute(app: FastifyInstance) {
  app.post('/auth', authenticateController)
}
