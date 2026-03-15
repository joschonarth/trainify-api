import type { User } from 'generated/prisma'

import type { UsersRepository } from '@/modules/user/repositories/users.repository'

import { InvalidGoogleTokenError } from '../errors/invalid-google-token.error'

interface SignInWithGoogleUseCaseRequest {
  token: string
}

interface SignInWithGoogleUseCaseResponse {
  user: User
}

export class SignInWithGoogleUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    token,
  }: SignInWithGoogleUseCaseRequest): Promise<SignInWithGoogleUseCaseResponse> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new InvalidGoogleTokenError(
        'Could not verify Google authentication.'
      )
    }

    const payload = await response.json()

    const { email, name, picture } = payload

    if (!email) {
      throw new InvalidGoogleTokenError(
        'Google account email could not be retrieved.'
      )
    }

    let user = await this.usersRepository.findByEmail(email)

    if (user) {
      const needsUpdate =
        (!user.name && name) ||
        (!user.avatarUrl && picture) ||
        user.name !== name ||
        user.avatarUrl !== picture

      if (needsUpdate) {
        user = await this.usersRepository.update(user.id, {
          name: name ?? user.name,
          avatarUrl: picture ?? user.avatarUrl,
        })
      }
    } else {
      user = await this.usersRepository.create({
        email,
        name: name ?? 'Google User',
        password: null,
        avatarUrl: picture ?? null,
      })
    }

    return { user }
  }
}
