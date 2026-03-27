import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchUserExercisesController } from '../controllers/fetch-user-exercises.controller'

export function fetchUserExercisesRoute(app: FastifyInstance) {
  app.get(
    '/exercises',
    { onRequest: [verifyJwt] },
    fetchUserExercisesController
  )
}
