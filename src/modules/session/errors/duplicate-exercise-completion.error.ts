import { AppError } from '@/shared/errors/app.error'

export class DuplicateExerciseCompletionError extends AppError {
  constructor() {
    super(400, 'Each exercise session can only be submitted once.')
  }
}
