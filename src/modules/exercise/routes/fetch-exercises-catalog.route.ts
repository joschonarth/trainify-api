import type { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/shared/middlewares/verify-jwt'
import { fetchExercisesCatalogController } from '../controllers/fetch-exercises-catalog.controller'

export function fetchExercisesCatalogRoute(app: FastifyInstance) {
  app.get(
    '/exercises/catalog',
    { onRequest: [verifyJwt] },
    fetchExercisesCatalogController
  )
}
