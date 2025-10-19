import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/shared/middlewares/verify-jwt'

import { getUserMetricsController } from '../controllers/get-user-metrics.controller'

export async function metricsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/metrics', getUserMetricsController)
}
