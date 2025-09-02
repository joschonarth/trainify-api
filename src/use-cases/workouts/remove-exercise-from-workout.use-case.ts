import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutExercisesRepository } from '@/repositories/workout-exercises.repository'

interface RemoveExerciseFromWorkoutUseCaseRequest {
  workoutExerciseId: string
}

export class RemoveExerciseFromWorkoutUseCase {
  constructor(private workoutExercisesRepository: WorkoutExercisesRepository) {}

  async execute({
    workoutExerciseId,
  }: RemoveExerciseFromWorkoutUseCaseRequest): Promise<void> {
    try {
      await this.workoutExercisesRepository.removeExerciseFromWorkout(
        workoutExerciseId,
      )
    } catch {
      throw new ResourceNotFoundError('Exercise not found.')
    }
  }
}
