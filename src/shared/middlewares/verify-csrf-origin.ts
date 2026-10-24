import type { FastifyRequest } from 'fastify'

import { getAllowedOrigin } from '@/config/allowed-origin'
import { NotAllowedError } from '../errors/not-allowed.error'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const BEARER_AUTHORIZATION_REGEX = /^Bearer\s+\S+$/i

export function isSafeMethod(method: string) {
  return SAFE_METHODS.has(method.toUpperCase())
}

export function hasAllowedOrigin(request: FastifyRequest) {
  return request.headers.origin === getAllowedOrigin()
}

export function hasBearerAuthorization(request: FastifyRequest) {
  return BEARER_AUTHORIZATION_REGEX.test(request.headers.authorization ?? '')
}

export function verifyCsrfOrigin(request: FastifyRequest): Promise<void> {
  if (isSafeMethod(request.method) || hasAllowedOrigin(request)) {
    return Promise.resolve()
  }

  return Promise.reject(new NotAllowedError('Invalid request origin.'))
}
