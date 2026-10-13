import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GoogleAuthProviderError } from '@/modules/user/errors/google-auth-provider.error'
import { InvalidCredentialsError } from '@/modules/user/errors/invalid-credentials.error'
import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'
import {
  type GoogleAuthProvider,
  GoogleUserInfoProvider,
} from '@/modules/user/providers/google-auth.provider'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'
import { makeUser } from '@/modules/user/tests/factories/make-user'

import { AuthenticateUseCase } from './authenticate.use-case'
import { SignInWithGoogleUseCase } from './sign-in-with-google.use-case'

let usersRepository: InMemoryUsersRepository
let googleAuthProvider: GoogleAuthProvider
let sut: SignInWithGoogleUseCase

describe('Sign In With Google Use Case', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('should reject a Google access token issued to another client', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ aud: 'another-client-id' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    vi.stubGlobal('fetch', fetchMock)
    googleAuthProvider = new GoogleUserInfoProvider('trainify-client-id')
    sut = new SignInWithGoogleUseCase(usersRepository, googleAuthProvider)

    await expect(
      sut.execute({ token: 'google-access-token' })
    ).rejects.toBeInstanceOf(InvalidGoogleTokenError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('should accept a Google access token issued to this client', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ aud: 'trainify-client-id' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            email: 'johndoe@example.com',
            verified_email: true,
            name: 'John Doe',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
    vi.stubGlobal('fetch', fetchMock)
    googleAuthProvider = new GoogleUserInfoProvider('trainify-client-id')
    sut = new SignInWithGoogleUseCase(usersRepository, googleAuthProvider)

    const { user } = await sut.execute({ token: 'google-access-token' })

    expect(user.email).toBe('johndoe@example.com')
    expect(fetchMock).toHaveBeenCalledTimes(2)
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

  it('should remove an existing password when linking a verified Google account', async () => {
    const user = await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.png',
      rawPassword: 'old-password',
    })
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: 'johndoe@example.com',
      verified_email: true,
      name: 'John Doe',
      picture: 'https://example.com/avatar.png',
    })
    const update = vi.spyOn(usersRepository, 'update')

    const { user: linkedUser } = await sut.execute({
      token: 'google-access-token',
    })

    expect(linkedUser.password).toBeNull()
    expect(update).toHaveBeenCalledWith(user.id, { password: null })
  })

  it('should not update an unchanged Google-only account', async () => {
    await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.png',
      password: null,
    })
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: 'johndoe@example.com',
      verified_email: true,
      name: 'John Doe',
      picture: 'https://example.com/avatar.png',
    })
    const update = vi.spyOn(usersRepository, 'update')

    await sut.execute({ token: 'google-access-token' })

    expect(update).not.toHaveBeenCalled()
  })

  it('should reject the old password after linking a verified Google account', async () => {
    await makeUser(usersRepository, {
      email: 'johndoe@example.com',
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.png',
      rawPassword: 'old-password',
    })
    vi.mocked(googleAuthProvider.getUserInfo).mockResolvedValue({
      email: 'johndoe@example.com',
      verified_email: true,
      name: 'John Doe',
      picture: 'https://example.com/avatar.png',
    })

    await sut.execute({ token: 'google-access-token' })

    const authenticate = new AuthenticateUseCase(usersRepository)
    await expect(
      authenticate.execute({
        email: 'johndoe@example.com',
        password: 'old-password',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
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
