import { FastifyInstance } from 'fastify'

import { usersRoutes } from './users.routes'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes)
}
