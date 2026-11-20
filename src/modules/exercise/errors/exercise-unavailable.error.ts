import { AppError } from '@/shared/errors/app.error'

export class ExerciseUnavailableError extends AppError {
  constructor() {
    super(409, 'Archived exercises cannot be newly associated.')
  }
}
