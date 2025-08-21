import { MyExercise } from '@prisma/client'

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

    const existing = await this.myExercisesRepository.findByUserAndExercise(
      userId,
      exerciseId,
    )

    if (existing) {
      return { myExercise: existing }
    }

    const myExercise = await this.myExercisesRepository.addExercise(
      userId,
      exerciseId,
    )

    return { myExercise }
  }
}
