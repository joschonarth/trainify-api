import type { FastifyReply, FastifyRequest } from 'fastify'
import { describe, expect, it, vi } from 'vitest'

import { refreshTokenController } from './refresh-token'

describe('refreshTokenController', () => {
  it('rejects an access token presented as a refresh token', async () => {
    const request = {
      cookies: { refreshToken: 'access-token' },
      server: {
        jwt: {
          verify: vi.fn().mockReturnValue({
            sub: 'user-1',
            email: 'user@example.com',
            type: 'access',
          }),
        },
      },
    } as unknown as FastifyRequest
    const reply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      jwtSign: vi.fn(),
    } as unknown as FastifyReply

    await refreshTokenController(request, reply)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Invalid or expired refresh token.',
    })
    expect(reply.jwtSign).not.toHaveBeenCalled()
  })
})
