import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserSchedulesController } from '../controllers/fetch-user-schedules.controller'

export function fetchUserSchedulesRoute(app: FastifyInstance) {
  app.get(
    '/me/schedules',
    { onRequest: [verifyJwt] },
    fetchUserSchedulesController
  )
}
