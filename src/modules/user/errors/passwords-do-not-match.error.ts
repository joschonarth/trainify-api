export class PasswordsDoNotMatchError extends Error {
  constructor(message = 'Passwords do not match.') {
    super(message)
    this.name = 'PasswordsDoNotMatchError'
  }
}
