import { AppError } from './app.error'

export class NotAllowedError extends AppError {
  constructor(message = 'Not allowed.') {
    super(403, message)
  }
}
