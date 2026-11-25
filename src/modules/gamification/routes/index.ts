import type { FastifyInstance } from 'fastify'

import { badgeRoutes } from '../badge/routes'
import { getProcessingRoute } from '../processing/get-processing.route'
import { streakRoutes } from '../streak/routes'

export function gamificationRoutes(app: FastifyInstance) {
  app.register(streakRoutes)
  app.register(badgeRoutes)
  app.register(getProcessingRoute)
}
