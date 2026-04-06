import type { FastifyInstance } from 'fastify'

import { getUserMetricsRoute } from './get-user-metrics.route'

export function metricsRoutes(app: FastifyInstance) {
  app.register(getUserMetricsRoute)
}
