import { AppError } from '@/shared/errors/app.error'

export class UserAlreadyExistsError extends AppError {
  constructor(message = 'E-mail already exists.') {
    super(409, message)
  }
}
