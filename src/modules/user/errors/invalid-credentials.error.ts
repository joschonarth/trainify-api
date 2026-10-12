import { AppError } from '@/shared/errors/app.error'

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid credentials.') {
    super(401, message)
  }
}
