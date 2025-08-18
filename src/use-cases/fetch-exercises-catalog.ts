import { Exercise } from '@prisma/client'

import { ExercisesRepository } from '@/repositories/exercises.repository'

interface FetchExercisesCatalogUseCaseResponse {
  exercises: Exercise[]
}

export class FetchExercisesCatalogUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute(): Promise<FetchExercisesCatalogUseCaseResponse> {
    const exercises = await this.exercisesRepository.findAllGlobals()
    return { exercises }
  }
}
