import { AppError } from '@/shared/errors/app.error'

export class WorkoutSessionNotStartedError extends AppError {
  constructor(message = 'Workout session has not started.') {
    super(400, message)
  }
}
