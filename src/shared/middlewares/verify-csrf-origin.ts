import type { FastifyReply, FastifyRequest } from 'fastify'

import { allowedOrigin } from '@/config/allowed-origin'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const BEARER_AUTHORIZATION_REGEX = /^Bearer\s+\S+$/i

export function isSafeMethod(method: string) {
  return SAFE_METHODS.has(method.toUpperCase())
}

export function hasAllowedOrigin(request: FastifyRequest) {
  return request.headers.origin === allowedOrigin
}

export function hasBearerAuthorization(request: FastifyRequest) {
  return BEARER_AUTHORIZATION_REGEX.test(request.headers.authorization ?? '')
}

export function verifyCsrfOrigin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (isSafeMethod(request.method) || hasAllowedOrigin(request)) {
    return Promise.resolve()
  }

  reply.status(403).send({ message: 'Invalid request origin.' })
  return Promise.resolve()
}
