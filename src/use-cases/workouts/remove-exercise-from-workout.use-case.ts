import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutExercisesRepository } from '@/repositories/workout-exercises.repository'
import { WorkoutsRepository } from '@/repositories/workouts.repository'

interface RemoveExerciseFromWorkoutUseCaseRequest {
  workoutId: string
  exerciseId: string
}

export class RemoveExerciseFromWorkoutUseCase {
  constructor(
    private workoutsRepository: WorkoutsRepository,
    private workoutExercisesRepository: WorkoutExercisesRepository,
  ) {}

  async execute({
    workoutId,
    exerciseId,
  }: RemoveExerciseFromWorkoutUseCaseRequest): Promise<void> {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const workoutExercise =
      await this.workoutExercisesRepository.findByWorkoutAndExercise(
        workoutId,
        exerciseId,
      )

    if (!workoutExercise) {
      throw new ResourceNotFoundError('Exercise not found in this workout.')
    }

    await this.workoutExercisesRepository.removeExerciseFromWorkout(
      workoutExercise.id,
    )
  }
}
