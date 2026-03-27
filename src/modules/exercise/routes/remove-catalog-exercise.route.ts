import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { removeCatalogExerciseController } from '../controllers/remove-catalog-exercise.controller'

export function removeCatalogExerciseRoute(app: FastifyInstance) {
  app.delete(
    '/exercises/my/catalog/:id',
    { onRequest: [verifyJwt] },
    removeCatalogExerciseController
  )
}
