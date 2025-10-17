export class UserAlreadyExistsError extends Error {
  constructor(message = 'E-mail already exists.') {
    super(message)
    this.name = 'UserAlreadyExistsError'
  }
}
