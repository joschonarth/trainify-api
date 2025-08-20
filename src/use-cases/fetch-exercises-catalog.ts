import { Exercise } from '@prisma/client'

import { ExercisesRepository } from '@/repositories/exercises.repository'

interface FetchExercisesCatalogUseCaseRequest {
  query: string
  page: number
}

interface FetchExercisesCatalogUseCaseResponse {
  exercises: Exercise[]
}

export class FetchExercisesCatalogUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    query,
    page,
  }: FetchExercisesCatalogUseCaseRequest): Promise<FetchExercisesCatalogUseCaseResponse> {
    const exercises = await this.exercisesRepository.findAllGlobals(query, page)

    return { exercises }
  }
}
