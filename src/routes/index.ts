import { FastifyInstance } from 'fastify'

import { exercisesRoutes } from './exercises.routes'
import { usersRoutes } from './users.routes'

export async function appRoutes(app: FastifyInstance) {
  app.register(usersRoutes)
  app.register(exercisesRoutes)
}
