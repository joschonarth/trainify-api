export class AppError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
  }
}
