import type { UsersRepository } from '@/modules/user/repositories/users.repository'

import { InvalidRefreshTokenError } from '../errors/invalid-refresh-token.error'

export interface RefreshTokenVerifier {
  verify(token: string): unknown
}

interface RefreshTokenUseCaseRequest {
  token: string
}

interface RefreshTokenUseCaseResponse {
  user: {
    id: string
    email: string
  }
}

function isRefreshTokenPayload(
  payload: unknown
): payload is { sub: string; type: 'refresh' } {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }

  return (
    'sub' in payload &&
    typeof payload.sub === 'string' &&
    payload.sub.length > 0 &&
    'type' in payload &&
    payload.type === 'refresh'
  )
}

export class RefreshTokenUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tokenVerifier: RefreshTokenVerifier
  ) {}

  async execute({
    token,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    let payload: unknown
    try {
      payload = this.tokenVerifier.verify(token)
    } catch {
      throw new InvalidRefreshTokenError()
    }

    if (!isRefreshTokenPayload(payload)) {
      throw new InvalidRefreshTokenError()
    }

    const user = await this.usersRepository.findById(payload.sub)
    if (!user) {
      throw new InvalidRefreshTokenError()
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
    }
  }
}
