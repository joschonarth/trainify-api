import type { Workout } from 'generated/prisma'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface UpdateWorkoutUseCaseRequest {
  workoutId: string
  userId: string
  name?: string
  description?: string | null
}

interface UpdateWorkoutUseCaseResponse {
  workout: Workout
}

export class UpdateWorkoutUseCase {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  async execute({
    workoutId,
    userId,
    name,
    description,
  }: UpdateWorkoutUseCaseRequest): Promise<UpdateWorkoutUseCaseResponse> {
    const workoutExists = await this.workoutsRepository.findById(workoutId)
    if (!workoutExists || workoutExists.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    let workout: Workout
    try {
      workout = await this.workoutsRepository.update(workoutId, {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      })
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ResourceAlreadyExistsError('Workout name already exists.')
      }
      throw error
    }

    return { workout }
  }
}
