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
    const googleUser: GoogleUserInfo =
      await this.googleAuthProvider.getUserInfo(token)

    if (!googleUser.verified_email) {
      throw new InvalidGoogleTokenError('Google account email is not verified.')
    }

    const email = googleUser.email.trim().toLowerCase()
    const { name, picture } = googleUser
    let user = await this.usersRepository.findByEmail(email)

    if (!user) {
      try {
        user = await this.usersRepository.create({
          email,
          name: name ?? 'Google User',
          password: null,
          avatarUrl: picture ?? null,
        })
      } catch (error) {
        if (
          typeof error !== 'object' ||
          error === null ||
          !('code' in error) ||
          error.code !== 'P2002'
        ) {
          throw error
        }

        const userCreatedConcurrently =
          await this.usersRepository.findByEmail(email)

        if (!userCreatedConcurrently) {
          throw error
        }

        user = userCreatedConcurrently
      }
    }

    const updateData = {
      ...(!user.name?.trim() && name && { name }),
      ...(!user.avatarUrl && picture && { avatarUrl: picture }),
      ...(user.password !== null && { password: null }),
      ...(user.password !== null && {
        tokenVersion: { increment: 1 },
      }),
    }

    if (Object.keys(updateData).length > 0) {
      // Temporary pre-hijacking mitigation: a verified Google email proves mailbox ownership.
      // Remove the pre-registered password until the app has its own email verification flow.
      user = await this.usersRepository.update(user.id, {
        ...updateData,
      })
    }

    return { user }
  }
}
