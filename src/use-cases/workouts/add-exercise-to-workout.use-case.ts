import { WorkoutExercise } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { ExercisesRepository } from '@/repositories/exercises.repository'
import { WorkoutExercisesRepository } from '@/repositories/workout-exercises.repository'
import { WorkoutsRepository } from '@/repositories/workouts.repository'

interface AddExerciseToWorkoutUseCaseRequest {
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
    private workoutExercisesRepository: WorkoutExercisesRepository,
    private workoutsRepository: WorkoutsRepository,
    private exercisesRepository: ExercisesRepository,
  ) {}

  async execute({
    workoutId,
    exerciseId,
    defaultSets,
    defaultReps,
    defaultWeight,
  }: AddExerciseToWorkoutUseCaseRequest): Promise<AddExerciseToWorkoutUseCaseResponse> {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const exercise = await this.exercisesRepository.findById(exerciseId)
    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
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
