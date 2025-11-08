import { Exercise } from '@prisma/client'

import { ExercisesRepository } from '../repositories/exercises.repository'

interface FetchUserExercisesUseCaseRequest {
  userId: string
}

interface FetchUserExercisesUseCaseResponse {
  exercises: Exercise[]
}

export class FetchUserExercisesUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    userId,
  }: FetchUserExercisesUseCaseRequest): Promise<FetchUserExercisesUseCaseResponse> {
    const exercises = await this.exercisesRepository.findManyByUser(userId)

    return { exercises }
  }
}
