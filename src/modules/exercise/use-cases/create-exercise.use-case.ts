import type { Exercise, ExerciseCategory, ExerciseType } from 'generated/prisma'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'

import type { ExercisesRepository } from '../repositories/exercises.repository'
import type { MyExercisesRepository } from '../repositories/my-exercises.repository'

interface CreateExerciseUseCaseRequest {
  userId: string
  name: string
  category: ExerciseCategory | null
  type: ExerciseType | null
}

interface CreateExerciseUseCaseResponse {
  exercise: Exercise
}

export class CreateExerciseUseCase {
  constructor(
    private readonly exercisesRepository: ExercisesRepository,
    _myExercisesRepository: MyExercisesRepository
  ) {}

  async execute({
    userId,
    name,
    category,
    type,
  }: CreateExerciseUseCaseRequest): Promise<CreateExerciseUseCaseResponse> {
    const existingExercise = await this.exercisesRepository.findByNameAndUser(
      name,
      userId
    )

    if (existingExercise) {
      throw new ResourceAlreadyExistsError(
        'Exercise with this name already exists for this user.'
      )
    }

    let exercise: Exercise
    try {
      exercise = await this.exercisesRepository.create({
        name,
        category,
        type,
        isCustom: true,
        createdAt: new Date(),
        user: { connect: { id: userId } },
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

    return { exercise }
  }
}
