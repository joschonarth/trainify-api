import type { Exercise, ExerciseCategory, ExerciseType } from 'generated/prisma'

import { NotAllowedError } from '@/shared/errors/not-allowed.error'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { ExercisesRepository } from '../repositories/exercises.repository'

interface UpdateExerciseUseCaseRequest {
  userId: string
  exerciseId: string
  name?: string | undefined
  category?: ExerciseCategory | null | undefined
  type?: ExerciseType | null | undefined
}

interface UpdateExerciseUseCaseResponse {
  exercise: Exercise
}

export class UpdateExerciseUseCase {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

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

    if (
      name !== undefined &&
      (await this.exercisesRepository.findByNameAndUser(
        name,
        userId,
        exerciseId
      ))
    ) {
      throw new ResourceAlreadyExistsError(
        'Exercise with this name already exists for this user.'
      )
    }

    let updatedExercise: Exercise
    try {
      updatedExercise = await this.exercisesRepository.update(exerciseId, {
        name: name ?? exercise.name,
        category: category ?? exercise.category,
        type: type ?? exercise.type,
      })
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ResourceAlreadyExistsError(
          'Exercise with this name already exists for this user.'
        )
      }

      throw error
    }

    return { exercise: updatedExercise }
  }
}
