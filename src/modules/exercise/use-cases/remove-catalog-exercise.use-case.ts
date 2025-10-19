import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { MyExercisesRepository } from '../repositories/my-exercises.repository'

interface RemoveCatalogExerciseUseCaseRequest {
  userId: string
  myExerciseId: string
}

export class RemoveCatalogExerciseUseCase {
  constructor(private myExercisesRepository: MyExercisesRepository) {}

  async execute({
    userId,
    myExerciseId,
  }: RemoveCatalogExerciseUseCaseRequest): Promise<void> {
    const myExercise = await this.myExercisesRepository.findById(myExerciseId)

    if (!myExercise || myExercise.userId !== userId) {
      throw new ResourceNotFoundError('Exercise not found in your list.')
    }

    await this.myExercisesRepository.deleteById(myExerciseId)
  }
}
