import type { FastifyReply, FastifyRequest } from 'fastify'
import { describe, expect, it, vi } from 'vitest'

import { getAllowedOrigin } from '@/config/allowed-origin'

import { verifyCsrfOrigin } from './verify-csrf-origin'
import { verifyJwt } from './verify-jwt'

function makeRequest(
  user: Record<string, unknown>,
  options: {
    method?: string
    origin?: string | undefined
    authorization?: string
  } = {}
) {
  return {
    jwtVerify: vi.fn().mockResolvedValue(undefined),
    method: options.method ?? 'GET',
    headers: {
      authorization: options.authorization,
      origin: options.origin,
    },
    user,
  } as unknown as FastifyRequest
}

function makeReply() {
  return {
    send: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply
}

describe('verifyJwt', () => {
  it('accepts an access token', async () => {
    const request = makeRequest({
      sub: 'user-1',
      email: 'user@example.com',
      type: 'access',
    })
    const reply = makeReply()

    await verifyJwt(request, reply)

    expect(reply.status).not.toHaveBeenCalled()
  })

  it.each([
    { sub: 'user-1', email: 'user@example.com', type: 'refresh' },
    { sub: 'user-1', email: 'user@example.com' },
  ])('rejects a token that is not explicitly an access token', async (user) => {
    const request = makeRequest(user)
    const reply = makeReply()

    await verifyJwt(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({ message: 'Unauthorized.' })
  })

  it('accepts a cookie-authenticated mutation from the allowed origin', async () => {
    const request = makeRequest(
      { sub: 'user-1', email: 'user@example.com', type: 'access' },
      { method: 'POST', origin: getAllowedOrigin('dev') }
    )
    const reply = makeReply()

    await verifyJwt(request, reply)

    expect(reply.status).not.toHaveBeenCalled()
  })

  it.each([
    undefined,
    'https://attacker.example',
  ])('rejects cookie-authenticated mutations from origin %s', async (origin) => {
    const request = makeRequest(
      { sub: 'user-1', email: 'user@example.com', type: 'access' },
      { method: 'POST', origin }
    )
    const reply = makeReply()

    await verifyJwt(request, reply)

    expect(reply.status).toHaveBeenCalledWith(403)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Invalid request origin.',
    })
  })

  it('allows Bearer-authenticated mutations without an Origin header', async () => {
    const request = makeRequest(
      { sub: 'user-1', email: 'user@example.com', type: 'access' },
      { method: 'POST', authorization: 'Bearer access-token' }
    )
    const reply = makeReply()

    await verifyJwt(request, reply)

    expect(reply.status).not.toHaveBeenCalled()
  })
})

describe('verifyCsrfOrigin', () => {
  it('rejects refresh requests from other origins', async () => {
    const request = makeRequest(
      {},
      {
        method: 'PATCH',
        origin: 'https://attacker.example',
      }
    )
    const reply = makeReply()

    await verifyCsrfOrigin(request, reply)

    expect(reply.status).toHaveBeenCalledWith(403)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Invalid request origin.',
    })
  })
})
