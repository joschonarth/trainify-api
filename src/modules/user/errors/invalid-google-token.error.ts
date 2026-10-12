import { AppError } from '@/shared/errors/app.error'

export class InvalidGoogleTokenError extends AppError {
  constructor(message = 'Invalid Google token.') {
    super(401, message)
  }
}
