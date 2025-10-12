import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users.repository'

import { SignInWithGoogleUseCase } from '../sign-in-with-google.use-case'

export function makeSignInWithGoogleUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const signInWithGoogleUseCase = new SignInWithGoogleUseCase(usersRepository)

  return signInWithGoogleUseCase
}
