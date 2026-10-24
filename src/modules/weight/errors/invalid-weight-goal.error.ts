import { AppError } from '@/shared/errors/app.error'

export class InvalidWeightGoalError extends AppError {
  constructor(
    message = 'Cannot log weight for an inactive or already achieved goal.'
  ) {
    super(400, message)
  }
}
