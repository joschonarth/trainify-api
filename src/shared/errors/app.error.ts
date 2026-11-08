export class AppError extends Error {
  readonly statusCode: number
  readonly details: Record<string, unknown> | undefined

  constructor(
    statusCode: number,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = new.target.name
    this.statusCode = statusCode
    this.details = details
  }
}
