import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { MyExercisesRepository } from '../repositories/my-exercises.repository'

interface RemoveCatalogExerciseUseCaseRequest {
  userId: string
  exerciseId: string
}

export class RemoveCatalogExerciseUseCase {
  constructor(private readonly myExercisesRepository: MyExercisesRepository) {}

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

    await this.myExercisesRepository.deleteById(myExercise.id)
  }
}
