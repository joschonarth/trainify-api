export class InvalidGoogleTokenError extends Error {
  constructor(message = 'Invalid Google token.') {
    super(message)
    this.name = 'InvalidGoogleTokenError'
  }
}
