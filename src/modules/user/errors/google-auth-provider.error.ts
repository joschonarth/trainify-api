export type GoogleAuthProviderStatus = 502 | 503

export class GoogleAuthProviderError extends Error {
  readonly statusCode: GoogleAuthProviderStatus

  constructor(
    statusCode: GoogleAuthProviderStatus,
    message = 'Google authentication service is unavailable.'
  ) {
    super(message)
    this.name = 'GoogleAuthProviderError'
    this.statusCode = statusCode
  }
}
