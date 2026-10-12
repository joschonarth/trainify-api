import type { FastifyReply, FastifyRequest } from 'fastify'
import { describe, expect, it, vi } from 'vitest'

import { verifyJwt } from './verify-jwt'

function makeRequest(user: Record<string, unknown>) {
  return {
    jwtVerify: vi.fn().mockResolvedValue(undefined),
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
})
