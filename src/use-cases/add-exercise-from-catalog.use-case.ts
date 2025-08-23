import { MyExercise } from '@prisma/client'

import { ResourceAlreadyExistsError } from '@/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { ExercisesRepository } from '@/repositories/exercises.repository'
import { MyExercisesRepository } from '@/repositories/my-exercises.repository'

interface AddExerciseFromCatalogUseCaseRequest {
  userId: string
  exerciseId: string
}

interface AddExerciseFromCatalogUseCaseResponse {
  myExercise: MyExercise
}

export class AddExerciseFromCatalogUseCase {
  constructor(
    private exercisesRepository: ExercisesRepository,
    private myExercisesRepository: MyExercisesRepository,
  ) {}

  async execute({
    userId,
    exerciseId,
  }: AddExerciseFromCatalogUseCaseRequest): Promise<AddExerciseFromCatalogUseCaseResponse> {
    const exercise = await this.exercisesRepository.findById(exerciseId)

    if (!exercise || exercise.isCustom) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    const existingExercise =
      await this.myExercisesRepository.findByUserAndExercise(userId, exerciseId)

    if (existingExercise) {
      throw new ResourceAlreadyExistsError(
        'You have already added this exercise.',
      )
    }

    const myExercise = await this.myExercisesRepository.addExercise(
      userId,
      exerciseId,
    )

    return { myExercise }
  }
}
