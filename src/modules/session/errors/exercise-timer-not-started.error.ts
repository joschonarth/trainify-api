import { AppError } from '@/shared/errors/app.error'

export class ExerciseTimerNotStartedError extends AppError {
  constructor(message = 'Exercise timer has not been started.') {
    super(400, message)
  }
}
