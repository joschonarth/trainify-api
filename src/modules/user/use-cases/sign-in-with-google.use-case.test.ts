import type { User } from 'generated/prisma'
import { describe, expect, it, vi } from 'vitest'

import { InvalidGoogleTokenError } from '@/modules/user/errors/invalid-google-token.error'
import type { GoogleAuthProvider } from '@/modules/user/providers/google-auth.provider'
import { InMemoryUsersRepository } from '@/modules/user/repositories/in-memory/in-memory-users.repository'

import { SignInWithGoogleUseCase } from './sign-in-with-google.use-case'

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Custom name',
    email: 'person@example.com',
    password: 'hashed-password',
    avatarUrl: null,
    height: null,
    weight: null,
    gender: null,
    birthdate: null,
    createdAt: new Date(),
    ...overrides,
  }
}

describe('SignInWithGoogleUseCase', () => {
  it('rejects unverified Google emails', async () => {
    const usersRepository = new InMemoryUsersRepository()
    usersRepository.items.push(makeUser())
    const googleAuthProvider: GoogleAuthProvider = {
      getUserInfo: vi.fn().mockResolvedValue({
        email: 'person@example.com',
        verified_email: false,
        name: 'Google name',
      }),
    }
    const signInWithGoogle = new SignInWithGoogleUseCase(
      usersRepository,
      googleAuthProvider
    )

    await expect(
      signInWithGoogle.execute({ token: 'access-token' })
    ).rejects.toBeInstanceOf(InvalidGoogleTokenError)
    expect(usersRepository.items[0]?.name).toBe('Custom name')
  })

  it('preserves customized profile fields and fills only empty fields', async () => {
    const usersRepository = new InMemoryUsersRepository()
    usersRepository.items.push(makeUser())
    const googleAuthProvider: GoogleAuthProvider = {
      getUserInfo: vi.fn().mockResolvedValue({
        email: 'PERSON@example.com',
        verified_email: true,
        name: 'Google name',
        picture: 'https://example.com/avatar.png',
      }),
    }
    const signInWithGoogle = new SignInWithGoogleUseCase(
      usersRepository,
      googleAuthProvider
    )

    const { user } = await signInWithGoogle.execute({ token: 'access-token' })

    expect(user.name).toBe('Custom name')
    expect(user.avatarUrl).toBe('https://example.com/avatar.png')
  })
})
