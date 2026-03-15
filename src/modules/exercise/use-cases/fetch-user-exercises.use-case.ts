import type { Exercise, ExerciseCategory, ExerciseType } from 'generated/prisma'

import type { ExercisesRepository } from '../repositories/exercises.repository'

interface FetchUserExercisesUseCaseRequest {
  userId: string
  query?: string
  category?: ExerciseCategory | null
  type?: ExerciseType | null
}

interface FetchUserExercisesUseCaseResponse {
  exercises: Exercise[]
}

export class FetchUserExercisesUseCase {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute({
    userId,
    query,
    category,
    type,
  }: FetchUserExercisesUseCaseRequest): Promise<FetchUserExercisesUseCaseResponse> {
    const exercises = await this.exercisesRepository.findManyByUser(
      userId,
      query,
      category,
      type
    )

    return { exercises }
  }
}
