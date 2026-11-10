import { AppError } from '@/shared/errors/app.error'

export class InvalidWorkoutExerciseOrderError extends AppError {
  constructor() {
    super(
      400,
      'The order must include every exercise in the workout exactly once.'
    )
  }
}
