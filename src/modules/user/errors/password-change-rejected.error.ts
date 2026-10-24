import { AppError } from '@/shared/errors/app.error'

export class PasswordChangeRejectedError extends AppError {
  constructor(message: 'Password change rejected.') {
    super(400, message)
  }
}
