export class InvalidRefreshTokenError extends Error {
  constructor(message = 'Invalid or expired refresh token.') {
    super(message)
    this.name = 'InvalidRefreshTokenError'
  }
}
