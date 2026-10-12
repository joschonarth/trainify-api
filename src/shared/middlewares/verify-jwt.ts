import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  hasAllowedOrigin,
  hasBearerAuthorization,
  isSafeMethod,
} from './verify-csrf-origin'

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()

    if (request.user?.sub == null || request.user.type !== 'access') {
      return reply.status(401).send({ message: 'Unauthorized.' })
    }

    if (
      !(
        hasBearerAuthorization(request) ||
        isSafeMethod(request.method) ||
        hasAllowedOrigin(request)
      )
    ) {
      return reply.status(403).send({ message: 'Invalid request origin.' })
    }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized.' })
  }
}
