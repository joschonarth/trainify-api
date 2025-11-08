import { Exercise, ExerciseCategory, ExerciseType } from '@prisma/client'

import { ExercisesRepository } from '../repositories/exercises.repository'

interface FetchUserExercisesUseCaseRequest {
  userId: string
  category?: ExerciseCategory | null
  type?: ExerciseType | null
}

interface FetchUserExercisesUseCaseResponse {
  exercises: Exercise[]
}

export class FetchUserExercisesUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    userId,
    category,
    type,
  }: FetchUserExercisesUseCaseRequest): Promise<FetchUserExercisesUseCaseResponse> {
    const exercises = await this.exercisesRepository.findManyByUser(
      userId,
      category,
      type,
    )

    return { exercises }
  }
}
