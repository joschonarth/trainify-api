export type GoogleAuthProviderStatus = 502 | 503

import { AppError } from '@/shared/errors/app.error'

export class GoogleAuthProviderError extends AppError {
  constructor(
    statusCode: GoogleAuthProviderStatus,
    message = 'Google authentication service is unavailable.'
  ) {
    super(statusCode, message)
  }
}
