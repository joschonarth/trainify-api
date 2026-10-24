import type { FastifyRequest } from 'fastify'
import { describe, expect, it, vi } from 'vitest'

import { getAllowedOrigin } from '@/config/allowed-origin'
import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { UnauthorizedError } from '@/shared/errors/unauthorized.error'

import { verifyCsrfOrigin } from './verify-csrf-origin'
import { verifyJwt } from './verify-jwt'

type UserPayload = Record<string, unknown>

function makeRequest(
  user: UserPayload | undefined,
  options: {
    method?: string
    origin?: string | undefined
    authorization?: string
    jwtVerifyError?: Error
  } = {}
) {
  const jwtVerify = options.jwtVerifyError
    ? vi.fn().mockRejectedValue(options.jwtVerifyError)
    : vi.fn().mockResolvedValue(undefined)

  return {
    jwtVerify,
    method: options.method ?? 'GET',
    headers: {
      authorization: options.authorization,
      origin: options.origin,
    },
    user,
  } as unknown as FastifyRequest
}

const accessUser = {
  sub: 'user-1',
  email: 'user@example.com',
  type: 'access',
}

describe('verifyJwt', () => {
  it('accepts an access token', async () => {
    const request = makeRequest(accessUser)

    await expect(verifyJwt(request)).resolves.toBeUndefined()
  })

  it('rejects when the JWT signature or expiration check fails', async () => {
    const request = makeRequest(undefined, {
      jwtVerifyError: new Error('jwt expired'),
    })

    await expect(verifyJwt(request)).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it.each([
    { sub: 'user-1', email: 'user@example.com', type: 'refresh' },
    { sub: 'user-1', email: 'user@example.com' },
    { email: 'user@example.com', type: 'access' },
  ])('rejects a token that is not an access token with a subject: %o', async (user) => {
    const request = makeRequest(user)

    await expect(verifyJwt(request)).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('accepts a cookie-authenticated mutation from the allowed origin', async () => {
    const request = makeRequest(accessUser, {
      method: 'POST',
      origin: getAllowedOrigin('dev'),
    })

    await expect(verifyJwt(request)).resolves.toBeUndefined()
  })

  it.each([
    undefined,
    'https://attacker.example',
  ])('rejects cookie-authenticated mutations from origin %s', async (origin) => {
    const request = makeRequest(accessUser, { method: 'POST', origin })

    await expect(verifyJwt(request)).rejects.toBeInstanceOf(NotAllowedError)
  })

  it('allows Bearer-authenticated mutations without an Origin header', async () => {
    const request = makeRequest(accessUser, {
      method: 'POST',
      authorization: 'Bearer access-token',
    })

    await expect(verifyJwt(request)).resolves.toBeUndefined()
  })
})

describe('verifyCsrfOrigin', () => {
  it('allows safe methods regardless of origin', async () => {
    const request = makeRequest(undefined, {
      method: 'GET',
      origin: 'https://attacker.example',
    })

    await expect(verifyCsrfOrigin(request)).resolves.toBeUndefined()
  })

  it('allows mutations from the allowed origin', async () => {
    const request = makeRequest(undefined, {
      method: 'PATCH',
      origin: getAllowedOrigin('dev'),
    })

    await expect(verifyCsrfOrigin(request)).resolves.toBeUndefined()
  })

  it('rejects refresh requests from other origins', async () => {
    const request = makeRequest(undefined, {
      method: 'PATCH',
      origin: 'https://attacker.example',
    })

    await expect(verifyCsrfOrigin(request)).rejects.toBeInstanceOf(
      NotAllowedError
    )
  })
})
