import { AppError } from '@/shared/errors/app.error'

interface AffectedWorkout {
  id: string
  name: string
}

export class ExerciseUsedInWorkoutsError extends AppError {
  constructor(workouts: AffectedWorkout[]) {
    super(
      409,
      'Exercise is used in one or more workouts and cannot be removed.',
      { workouts }
    )
  }
}
