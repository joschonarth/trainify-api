import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { getExerciseDetailsController } from '../controllers/get-exercise-details.controller'

export function getExerciseDetailsRoute(app: FastifyInstance) {
  app.get(
    '/exercises/:id',
    { onRequest: [verifyJwt] },
    getExerciseDetailsController
  )
}
