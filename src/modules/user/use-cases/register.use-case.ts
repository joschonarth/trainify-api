import { User } from '@prisma/client'
import { hash } from 'bcrypt'

import { PasswordsDoNotMatchError } from '@/modules/user/errors/passwords-do-not-match.error'
import { UserAlreadyExistsError } from '@/modules/user/errors/user-already-exists.error'
import { UsersRepository } from '@/modules/user/repositories/users.repository'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
    passwordConfirmation,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    console.log('[RegisterUseCase] Iniciando registro:', email)

    if (password !== passwordConfirmation) {
      console.log('[RegisterUseCase] Senhas não conferem')
      throw new PasswordsDoNotMatchError()
    }

    let userWithSameEmail: User | null = null
    try {
      userWithSameEmail = await this.usersRepository.findByEmail(email)
      console.log(
        '[RegisterUseCase] Verificado usuário existente:',
        userWithSameEmail,
      )
    } catch (err) {
      console.error('[RegisterUseCase] Erro ao buscar usuário existente:', err)
      throw err
    }

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    let passwordHash: string
    try {
      passwordHash = await hash(password, 6)
      console.log('[RegisterUseCase] Password hash gerado')
    } catch (err) {
      console.error('[RegisterUseCase] Erro ao gerar hash da senha:', err)
      throw err
    }

    let user: User
    try {
      user = await this.usersRepository.create({
        name,
        email,
        password: passwordHash,
      })
      console.log('[RegisterUseCase] Usuário criado com sucesso:', user)
    } catch (err) {
      console.error('[RegisterUseCase] Erro ao criar usuário no banco:', err)
      throw err
    }

    return { user }
  }
}
