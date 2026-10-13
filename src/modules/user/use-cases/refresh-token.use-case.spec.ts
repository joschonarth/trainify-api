import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InvalidRefreshTokenError } from '@/modules/user/errors/invalid-refresh-token.error'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'

import type { RefreshTokenVerifier } from './refresh-token.use-case'
import { RefreshTokenUseCase } from './refresh-token.use-case'

let usersRepository: InMemoryUsersRepository
let tokenVerifier: RefreshTokenVerifier
let sut: RefreshTokenUseCase

describe('Refresh Token Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    tokenVerifier = {
      verify: vi.fn(),
    }
    sut = new RefreshTokenUseCase(usersRepository, tokenVerifier)
  })

  it('should return the existing user for a valid refresh token', async () => {
    const user = await makeUser(usersRepository)
    vi.mocked(tokenVerifier.verify).mockReturnValue({
      sub: user.id,
      type: 'refresh',
      tokenVersion: user.tokenVersion,
    })

    await expect(
      sut.execute({ token: 'valid-refresh-token' })
    ).resolves.toEqual({
      user: {
        id: user.id,
        email: user.email,
        tokenVersion: user.tokenVersion,
      },
    })
  })

  it('should reject a token with an invalid signature or expiration', async () => {
    vi.mocked(tokenVerifier.verify).mockImplementation(() => {
      throw new Error('Invalid token.')
    })

    await expect(
      sut.execute({ token: 'invalid-refresh-token' })
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should reject an access token used as a refresh token', async () => {
    vi.mocked(tokenVerifier.verify).mockReturnValue({
      sub: 'user-1',
      type: 'access',
    })

    await expect(sut.execute({ token: 'access-token' })).rejects.toBeInstanceOf(
      InvalidRefreshTokenError
    )
  })

  it('should reject a refresh token when its user no longer exists', async () => {
    vi.mocked(tokenVerifier.verify).mockReturnValue({
      sub: 'deleted-user',
      type: 'refresh',
      tokenVersion: 0,
    })

    await expect(
      sut.execute({ token: 'orphaned-refresh-token' })
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should reject a refresh token with an outdated version', async () => {
    const user = await makeUser(usersRepository, { tokenVersion: 2 })
    vi.mocked(tokenVerifier.verify).mockReturnValue({
      sub: user.id,
      type: 'refresh',
      tokenVersion: 1,
    })

    await expect(
      sut.execute({ token: 'outdated-refresh-token' })
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should reject a refresh token without a tokenVersion claim', async () => {
    const user = await makeUser(usersRepository)
    vi.mocked(tokenVerifier.verify).mockReturnValue({
      sub: user.id,
      type: 'refresh',
    })

    await expect(
      sut.execute({ token: 'refresh-token-without-version' })
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError)
  })
})
