import { AppError } from '@/shared/errors/app.error'

export class AnotherExerciseTimerRunningError extends AppError {
  constructor(
    message = 'Another exercise timer is already running in this workout session.'
  ) {
    super(409, message)
  }
}
