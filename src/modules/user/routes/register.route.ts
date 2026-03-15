import type { FastifyInstance } from 'fastify'
import { registerController } from '@/modules/user/controllers/register.controller'

export function registerRoute(app: FastifyInstance) {
  app.post('/users', registerController)
}
