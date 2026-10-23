import { AppError } from '@/shared/errors/app.error'

export class WorkoutSessionAlreadyCompletedError extends AppError {
  constructor(message = 'Workout session already completed.') {
    super(409, message)
  }
}
