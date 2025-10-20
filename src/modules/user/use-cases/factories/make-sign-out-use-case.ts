import { SignOutUseCase } from '../sign-out.use-case'

export function makeSignOutUseCase() {
  const signOutUseCase = new SignOutUseCase()

  return signOutUseCase
}
