import { NotAllowedError } from '@/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { ExercisesRepository } from '../repositories/exercises.repository'

interface DeleteCustomExerciseUseCaseRequest {
  userId: string
  exerciseId: string
}

export class DeleteCustomExerciseUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    userId,
    exerciseId,
  }: DeleteCustomExerciseUseCaseRequest): Promise<void> {
    const exercise = await this.exercisesRepository.findById(exerciseId)

    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    if (!exercise.isCustom) {
      throw new NotAllowedError('Only custom exercises can be deleted.')
    }

    if (exercise.userId !== userId) {
      throw new NotAllowedError('You can only delete your own exercises.')
    }

    await this.exercisesRepository.delete(exerciseId)
  }
}
