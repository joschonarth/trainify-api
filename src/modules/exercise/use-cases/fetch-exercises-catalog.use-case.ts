import type { Exercise, ExerciseCategory } from 'generated/prisma'

import type { ExercisesRepository } from '../repositories/exercises.repository'

interface FetchExercisesCatalogUseCaseRequest {
  query: string
  category: ExerciseCategory
  page: number
}

interface FetchExercisesCatalogUseCaseResponse {
  exercises: Exercise[]
}

export class FetchExercisesCatalogUseCase {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute({
    query,
    category,
    page,
  }: FetchExercisesCatalogUseCaseRequest): Promise<FetchExercisesCatalogUseCaseResponse> {
    const exercises = await this.exercisesRepository.findAllGlobals(
      query,
      category,
      page
    )

    return { exercises }
  }
}
