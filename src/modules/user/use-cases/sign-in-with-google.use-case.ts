import type { User } from 'generated/prisma'
import type {
  GoogleAuthProvider,
  GoogleUserInfo,
} from '@/modules/user/providers/google-auth.provider'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'

import { InvalidGoogleTokenError } from '../errors/invalid-google-token.error'

interface SignInWithGoogleUseCaseRequest {
  token: string
}

interface SignInWithGoogleUseCaseResponse {
  user: User
}

export class SignInWithGoogleUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly googleAuthProvider: GoogleAuthProvider
  ) {}

  async execute({
    token,
  }: SignInWithGoogleUseCaseRequest): Promise<SignInWithGoogleUseCaseResponse> {
    let googleUser: GoogleUserInfo
    try {
      googleUser = await this.googleAuthProvider.getUserInfo(token)
    } catch {
      throw new InvalidGoogleTokenError(
        'Could not verify Google authentication.'
      )
    }

    if (!googleUser.verified_email) {
      throw new InvalidGoogleTokenError('Google account email is not verified.')
    }

    const email = googleUser.email.trim().toLowerCase()
    const { name, picture } = googleUser
    let user = await this.usersRepository.findByEmail(email)

    if (user) {
      const needsUpdate =
        (!user.name?.trim() && name) || (!user.avatarUrl && picture)

      if (needsUpdate) {
        user = await this.usersRepository.update(user.id, {
          ...(!user.name?.trim() && name && { name }),
          ...(!user.avatarUrl && picture && { avatarUrl: picture }),
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
