import { Exercise, ExerciseCategory, ExerciseType } from '@prisma/client'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { ExercisesRepository } from '../repositories/exercises.repository'

interface UpdateExerciseUseCaseRequest {
  userId: string
  exerciseId: string
  name?: string | null | undefined
  category?: ExerciseCategory | null | undefined
  type?: ExerciseType | null | undefined
}

interface UpdateExerciseUseCaseResponse {
  exercise: Exercise
}

export class UpdateExerciseUseCase {
  constructor(private exercisesRepository: ExercisesRepository) {}

  async execute({
    userId,
    exerciseId,
    name,
    category,
    type,
  }: UpdateExerciseUseCaseRequest): Promise<UpdateExerciseUseCaseResponse> {
    const exercise = await this.exercisesRepository.findById(exerciseId)

    if (!exercise) {
      throw new ResourceNotFoundError('Exercise not found.')
    }

    if (!exercise.isCustom) {
      throw new NotAllowedError('Catalog exercises cannot be updated.')
    }

    if (exercise.userId !== userId) {
      throw new NotAllowedError('You can only update your own exercises.')
    }

    const updatedExercise = await this.exercisesRepository.update(exerciseId, {
      name: name ?? exercise.name,
      category: category ?? exercise.category,
      type: type ?? exercise.type,
    })

    return { exercise: updatedExercise }
  }
}
