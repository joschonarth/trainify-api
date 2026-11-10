import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { InvalidWorkoutExerciseOrderError } from '../errors/invalid-workout-exercise-order.error'
import type { WorkoutExercisesRepository } from '../repositories/workout-exercises.repository'
import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface ReorderWorkoutExercisesUseCaseRequest {
  userId: string
  workoutId: string
  exerciseIds: string[]
}

export class ReorderWorkoutExercisesUseCase {
  constructor(
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly workoutExercisesRepository: WorkoutExercisesRepository
  ) {}

  async execute({
    userId,
    workoutId,
    exerciseIds,
  }: ReorderWorkoutExercisesUseCaseRequest) {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const exercises =
      await this.workoutExercisesRepository.findByWorkout(workoutId)
    const currentExerciseIds = new Set(
      exercises.map(({ exerciseId }) => exerciseId)
    )
    const reorderedExerciseIds = new Set(exerciseIds)

    if (
      reorderedExerciseIds.size !== exerciseIds.length ||
      currentExerciseIds.size !== exerciseIds.length ||
      exerciseIds.some((exerciseId) => !currentExerciseIds.has(exerciseId))
    ) {
      throw new InvalidWorkoutExerciseOrderError()
    }

    await this.workoutExercisesRepository.updatePositions(
      workoutId,
      exerciseIds
    )

    return {
      exercises: await this.workoutExercisesRepository.findByWorkout(workoutId),
    }
  }
}
