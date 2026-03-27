import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { createExerciseController } from '../controllers/create-exercise.controller'

export function createExerciseRoute(app: FastifyInstance) {
  app.post(
    '/exercises/my',
    { onRequest: [verifyJwt] },
    createExerciseController
  )
}
