import { AppError } from '@/shared/errors/app.error'

export class WorkoutSessionAlreadyInProgressError extends AppError {
  constructor(message = 'Workout session already in progress.') {
    super(409, message)
  }
}
