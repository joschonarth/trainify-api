import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchMyExercisesController } from '../controllers/fetch-my-exercises.controller'

export function fetchMyExercisesRoute(app: FastifyInstance) {
  app.get(
    '/exercises/my',
    { onRequest: [verifyJwt] },
    fetchMyExercisesController
  )
}
