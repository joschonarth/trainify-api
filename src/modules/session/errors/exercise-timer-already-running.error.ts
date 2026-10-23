import { AppError } from '@/shared/errors/app.error'

export class ExerciseTimerAlreadyRunningError extends AppError {
  constructor(message = 'Exercise timer already started.') {
    super(409, message)
  }
}
