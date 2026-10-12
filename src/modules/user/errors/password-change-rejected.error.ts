import { AppError } from '@/shared/errors/app.error'

export class PasswordChangeRejectedError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}
