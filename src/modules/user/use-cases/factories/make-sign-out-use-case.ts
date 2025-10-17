import { SignOutUseCase } from '../sign-out.use-case'

export function makeSignOutUseCase() {
  const useCase = new SignOutUseCase()

  return useCase
}
