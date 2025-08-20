import { Exercise } from '@prisma/client'

import { NotAllowedError } from '@/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { ExercisesRepository } from '@/repositories/exercises.repository'

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
      throw new ResourceNotFoundError()
    }

    if (exercise.isCustom && exercise.userId !== userId) {
      throw new NotAllowedError()
    }

    return { exercise }
  }
}
