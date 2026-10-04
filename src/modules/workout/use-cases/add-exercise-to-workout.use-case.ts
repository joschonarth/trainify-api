import type { WorkoutExercise } from 'generated/prisma'

import type { ExercisesRepository } from '@/modules/exercise/repositories/exercises.repository'
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
    private readonly exercisesRepository: ExercisesRepository
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
