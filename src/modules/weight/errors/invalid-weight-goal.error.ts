import { AppError } from '@/shared/errors/app.error'

export class InvalidWeightGoalError extends AppError {
  constructor(message = 'Invalid weight goal.') {
    super(400, message)
  }
}
