import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { addExerciseFromCatalogController } from '../controllers/add-exercise-from-catalog.controller'

export function addExerciseFromCatalogRoute(app: FastifyInstance) {
  app.post(
    '/exercises/catalog/:id/add',
    { onRequest: [verifyJwt] },
    addExerciseFromCatalogController
  )
}
