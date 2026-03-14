import type { Exercise } from '@prisma/client'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { ExercisesRepository } from '../repositories/exercises.repository'

interface GetExerciseDetailsUseCaseRequest {
  exerciseId: string
  userId: string
}

interface GetExerciseDetailsUseCaseResponse {
  exercise: Exercise | null
}

export class GetExerciseDetailsUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    exerciseId,
    userId,
  }: GetExerciseDetailsUseCaseRequest): Promise<GetExerciseDetailsUseCaseResponse> {
    const exercise = await this.exercisesRepository.findById(exerciseId)

    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    if (exercise.isCustom && exercise.userId !== userId) {
      throw new NotAllowedError('You do not have access to this exercise.')
    }

    return { exercise }
  }
}
