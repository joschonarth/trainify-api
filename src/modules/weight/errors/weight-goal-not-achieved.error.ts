import { AppError } from '@/shared/errors/app.error'

export class WeightGoalNotAchievedError extends AppError {
  constructor(message = 'Weight goal not yet achieved.') {
    super(400, message)
  }
}
