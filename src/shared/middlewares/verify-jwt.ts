import type { FastifyRequest } from 'fastify'
import { NotAllowedError } from '../errors/not-allowed.error'
import { UnauthorizedError } from '../errors/unauthorized.error'
import {
  hasAllowedOrigin,
  hasBearerAuthorization,
  isSafeMethod,
} from './verify-csrf-origin'

export async function verifyJwt(request: FastifyRequest) {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedError()
  }

  if (request.user?.sub == null || request.user.type !== 'access') {
    throw new UnauthorizedError()
  }

  const isAllowedRequest =
    hasBearerAuthorization(request) ||
    isSafeMethod(request.method) ||
    hasAllowedOrigin(request)

  if (!isAllowedRequest) {
    throw new NotAllowedError('Invalid request origin.')
  }
}
