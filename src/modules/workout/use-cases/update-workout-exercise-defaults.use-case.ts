import { WorkoutExercise } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WorkoutExercisesRepository } from '../repositories/workout-exercises.repository'
import { WorkoutsRepository } from '../repositories/workouts.repository'

interface UpdateWorkoutExerciseDefaultsUseCaseRequest {
  workoutId: string
  exerciseId: string
  defaultSets: number | null
  defaultReps: number | null
  defaultWeight: number | null
}

interface UpdateWorkoutExerciseDefaultsUseCaseResponse {
  workoutExercise: WorkoutExercise
}

export class UpdateWorkoutExerciseDefaultsUseCase {
  constructor(
    private workoutsRepository: WorkoutsRepository,
    private workoutExercisesRepository: WorkoutExercisesRepository,
  ) {}

  async execute({
    workoutId,
    exerciseId,
    defaultSets,
    defaultReps,
    defaultWeight,
  }: UpdateWorkoutExerciseDefaultsUseCaseRequest): Promise<UpdateWorkoutExerciseDefaultsUseCaseResponse> {
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

    const updatedWorkoutExercise =
      await this.workoutExercisesRepository.updateDefaults(workoutExercise.id, {
        defaultSets,
        defaultReps,
        defaultWeight,
      })

    return { workoutExercise: updatedWorkoutExercise }
  }
}
