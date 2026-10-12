import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoogleAuthProviderError } from '@/modules/user/errors/google-auth-provider.error'
import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'
import type { GoogleAuthProvider } from '@/modules/user/providers/google-auth.provider'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'

import { SignInWithGoogleUseCase } from './sign-in-with-google.use-case'

let usersRepository: InMemoryUsersRepository
let googleAuthProvider: GoogleAuthProvider
let sut: SignInWithGoogleUseCase

describe('Sign In With Google Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    googleAuthProvider = {
      getUserInfo: vi.fn(),
    }
    sut = new SignInWithGoogleUseCase(usersRepository, googleAuthProvider)
  })

  it('should create a user from a verified Google account', async () => {
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: '  JOHNDOE@example.com ',
      verified_email: true,
      name: 'John Doe',
      picture: 'https://example.com/avatar.png',
    })

    const { user } = await sut.execute({ token: 'google-access-token' })

    expect(user).toMatchObject({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: null,
      avatarUrl: 'https://example.com/avatar.png',
    })
    expect(googleAuthProvider.getUserInfo).toHaveBeenCalledWith(
      'google-access-token'
    )
  })

  it('should reject an invalid Google token', async () => {
    vi.mocked(googleAuthProvider.getUserInfo).mockRejectedValue(
      new InvalidGoogleTokenError('Google token is invalid.')
    )

    await expect(
      sut.execute({ token: 'invalid-token' })
    ).rejects.toBeInstanceOf(InvalidGoogleTokenError)
  })

  it('should recover when another login creates the user concurrently', async () => {
    const concurrentUser = await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      name: 'Concurrent user',
    })
    const findByEmail = vi
      .spyOn(usersRepository, 'findByEmail')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(concurrentUser)
    vi.spyOn(usersRepository, 'create').mockRejectedValue(
      Object.assign(new Error('Unique constraint failed.'), { code: 'P2002' })
    )
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: 'johndoe@example.com',
      verified_email: true,
      name: 'Google name',
    })

    const { user } = await sut.execute({ token: 'google-access-token' })

    expect(user.id).toBe(concurrentUser.id)
    expect(user.name).toBe('Concurrent user')
    expect(findByEmail).toHaveBeenCalledTimes(2)
  })

  it.each([
    502, 503,
  ] as const)('should preserve Google provider errors with status %i', async (statusCode) => {
    const providerError = new GoogleAuthProviderError(statusCode)
    vi.mocked(googleAuthProvider.getUserInfo).mockRejectedValue(providerError)

    await expect(sut.execute({ token: 'google-access-token' })).rejects.toBe(
      providerError
    )
  })

  it('should reject an unverified Google email before looking up a user', async () => {
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: 'johndoe@example.com',
      verified_email: false,
      name: 'John Doe',
    })
    const findByEmail = vi.spyOn(usersRepository, 'findByEmail')

    await expect(
      sut.execute({ token: 'google-access-token' })
    ).rejects.toBeInstanceOf(InvalidGoogleTokenError)

    expect(findByEmail).not.toHaveBeenCalled()
  })

  it('should preserve customized profile fields and fill only empty fields', async () => {
    const user = await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      name: 'Customized name',
      avatarUrl: null,
    })
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: 'JOHNDOE@example.com',
      verified_email: true,
      name: 'Google name',
      picture: 'https://example.com/avatar.png',
    })

    const { user: signedInUser } = await sut.execute({
      token: 'google-access-token',
    })

    expect(signedInUser.id).toBe(user.id)
    expect(signedInUser.name).toBe('Customized name')
    expect(signedInUser.avatarUrl).toBe('https://example.com/avatar.png')
  })

  it('should fill an empty name from Google', async () => {
    await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      name: '',
    })
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: 'johndoe@example.com',
      verified_email: true,
      name: 'Google name',
    })

    const { user } = await sut.execute({ token: 'google-access-token' })

    expect(user.name).toBe('Google name')
  })
})
