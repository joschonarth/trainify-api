import { AppError } from '@/shared/errors/app.error'

export class PasswordsDoNotMatchError extends AppError {
  constructor(message = 'Passwords do not match.') {
    super(400, message)
  }
}
