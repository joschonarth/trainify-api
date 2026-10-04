import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutExercisesRepository } from '../repositories/workout-exercises.repository'
import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface RemoveExerciseFromWorkoutUseCaseRequest {
  userId: string
  workoutId: string
  exerciseId: string
}

export class RemoveExerciseFromWorkoutUseCase {
  constructor(
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly workoutExercisesRepository: WorkoutExercisesRepository
  ) {}

  async execute({
    userId,
    workoutId,
    exerciseId,
  }: RemoveExerciseFromWorkoutUseCaseRequest): Promise<void> {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const workoutExercise =
      await this.workoutExercisesRepository.findByWorkoutAndExercise(
        workoutId,
        exerciseId
      )

    if (!workoutExercise) {
      throw new ResourceNotFoundError('Exercise not found in this workout.')
    }

    await this.workoutExercisesRepository.removeExerciseFromWorkout(
      workoutExercise.id
    )
  }
}
