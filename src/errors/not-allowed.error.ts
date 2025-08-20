export class NotAllowedError extends Error {
  constructor(message = 'Not allowed.') {
    super(message)
    this.name = 'NotAllowedError'
  }
}
