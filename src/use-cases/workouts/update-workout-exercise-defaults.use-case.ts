import { WorkoutExercise } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutExercisesRepository } from '@/repositories/workout-exercises.repository'

interface UpdateWorkoutExerciseDefaultsUseCaseRequest {
  workoutExerciseId: string
  defaultSets: number | null
  defaultReps: number | null
  defaultWeight: number | null
}

interface UpdateWorkoutExerciseDefaultsUseCaseResponse {
  workoutExercise: WorkoutExercise
}

export class UpdateWorkoutExerciseDefaultsUseCase {
  constructor(private workoutExercisesRepository: WorkoutExercisesRepository) {}

  async execute({
    workoutExerciseId,
    defaultSets,
    defaultReps,
    defaultWeight,
  }: UpdateWorkoutExerciseDefaultsUseCaseRequest): Promise<UpdateWorkoutExerciseDefaultsUseCaseResponse> {
    const existing =
      await this.workoutExercisesRepository.findById?.(workoutExerciseId)
    if (!existing) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    const workoutExercise =
      await this.workoutExercisesRepository.updateDefaults(workoutExerciseId, {
        defaultSets,
        defaultReps,
        defaultWeight,
      })

    return { workoutExercise }
  }
}
