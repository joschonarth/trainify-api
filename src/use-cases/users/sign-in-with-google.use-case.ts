import { User } from '@prisma/client'

import { UsersRepository } from '@/repositories/users.repository'

interface SignInWithGoogleUseCaseRequest {
  token: string
}

interface SignInWithGoogleUseCaseResponse {
  user: User
}

export class SignInWithGoogleUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    token,
  }: SignInWithGoogleUseCaseRequest): Promise<SignInWithGoogleUseCaseResponse> {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
    )

    const payload = await response.json()

    if (payload.error_description) {
      throw new Error('Token do Google inválido.')
    }

    const { email, name, picture } = payload

    if (!email) {
      throw new Error('Não foi possível obter o e-mail do usuário Google.')
    }

    let user = await this.usersRepository.findByEmail(email)

    if (!user) {
      user = await this.usersRepository.create({
        email,
        name: name ?? 'Usuário Google',
        password: null,
        avatarUrl: picture ?? null,
      })
    }

    return { user }
  }
}
