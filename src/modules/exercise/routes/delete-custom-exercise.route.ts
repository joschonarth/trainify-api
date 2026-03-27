import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { deleteCustomExerciseController } from '../controllers/delete-custom-exercise.controller'

export function deleteCustomExerciseRoute(app: FastifyInstance) {
  app.delete(
    '/exercises/my/custom/:exerciseId',
    { onRequest: [verifyJwt] },
    deleteCustomExerciseController
  )
}
