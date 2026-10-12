import { GoogleUserInfoProvider } from '@/modules/user/providers/google-auth.provider'
import { PrismaUsersRepository } from '@/modules/user/repositories/prisma/prisma-users.repository'

import { SignInWithGoogleUseCase } from '../sign-in-with-google.use-case'

export function makeSignInWithGoogleUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const googleAuthProvider = new GoogleUserInfoProvider()
  const signInWithGoogleUseCase = new SignInWithGoogleUseCase(
    usersRepository,
    googleAuthProvider
  )

  return signInWithGoogleUseCase
}
