import { AppError } from '@/shared/errors/app.error'

export class InvalidRefreshTokenError extends AppError {
  constructor(message = 'Invalid or expired refresh token.') {
    super(401, message)
  }
}
