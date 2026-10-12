import { AppError } from './app.error'

export class ResourceNotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(404, message)
  }
}
