import { ExerciseUsedInWorkoutsError } from '@/modules/exercise/errors/exercise-used-in-workouts.error'
import type { WorkoutsRepository } from '@/modules/workout/repositories/workouts.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { MyExercisesRepository } from '../repositories/my-exercises.repository'

interface RemoveCatalogExerciseUseCaseRequest {
  userId: string
  exerciseId: string
}

export class RemoveCatalogExerciseUseCase {
  constructor(
    private readonly myExercisesRepository: MyExercisesRepository,
    private readonly workoutsRepository: WorkoutsRepository
  ) {}

  async execute({
    userId,
    exerciseId,
  }: RemoveCatalogExerciseUseCaseRequest): Promise<void> {
    const myExercise = await this.myExercisesRepository.findByUserAndExercise(
      userId,
      exerciseId
    )

    if (!myExercise) {
      throw new ResourceNotFoundError('Exercise not found in your list.')
    }

    const workouts = await this.workoutsRepository.findByUserAndExercise(
      userId,
      exerciseId
    )
    if (workouts.length > 0) {
      throw new ExerciseUsedInWorkoutsError(workouts)
    }

    await this.myExercisesRepository.deleteById(myExercise.id)
  }
}
