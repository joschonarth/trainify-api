import type { FastifyInstance } from 'fastify'
import { signInWithGoogleController } from '../controllers/sign-in-with-google.controller'

export function signInWithGoogleRoute(app: FastifyInstance) {
  app.post('/auth/google', signInWithGoogleController)
}
