import { FastifyInstance } from 'fastify'

import { logWeightController } from '@/controllers/weight/log-weight.controller'
import { verifyJwt } from '@/middlewares/verify-jwt'

export async function weightRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.post('/weight/logs', logWeightController)
}
