import type { WorkoutExercise } from 'generated/prisma'

import type { ExercisesRepository } from '@/modules/exercise/repositories/exercises.repository'
import type { MyExercisesRepository } from '@/modules/exercise/repositories/my-exercises.repository'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutExercisesRepository } from '../repositories/workout-exercises.repository'
import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface AddExerciseToWorkoutUseCaseRequest {
  userId: string
  workoutId: string
  exerciseId: string
  defaultSets: number | null
  defaultReps: number | null
  defaultWeight: number | null
}

interface AddExerciseToWorkoutUseCaseResponse {
  workoutExercise: WorkoutExercise
}

export class AddExerciseToWorkoutUseCase {
  constructor(
    private readonly workoutExercisesRepository: WorkoutExercisesRepository,
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly exercisesRepository: ExercisesRepository,
    private readonly myExercisesRepository: MyExercisesRepository
  ) {}

  async execute({
    userId,
    workoutId,
    exerciseId,
    defaultSets,
    defaultReps,
    defaultWeight,
  }: AddExerciseToWorkoutUseCaseRequest): Promise<AddExerciseToWorkoutUseCaseResponse> {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const exercise = await this.exercisesRepository.findById(exerciseId)
    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    if (
      exercise.archivedAt !== null ||
      (exercise.userId !== null && exercise.userId !== userId)
    ) {
      throw new ResourceNotFoundError('Exercise not found in user library.')
    }

    const libraryEntry = await this.myExercisesRepository.findByUserAndExercise(
      userId,
      exerciseId
    )
    if (!libraryEntry) {
      throw new ResourceNotFoundError('Exercise not found in user library.')
    }

    const existing =
      await this.workoutExercisesRepository.findByWorkoutAndExercise(
        workoutId,
        exerciseId
      )

    if (existing) {
      throw new ResourceAlreadyExistsError(
        'Exercise is already added to this workout.'
      )
    }

    const workoutExercise =
      await this.workoutExercisesRepository.addExerciseToWorkout({
        workout: { connect: { id: workoutId } },
        exercise: { connect: { id: exerciseId } },
        defaultSets: defaultSets ?? null,
        defaultReps: defaultReps ?? null,
        defaultWeight: defaultWeight ?? null,
      })

    return { workoutExercise }
  }
}
