import type { Workout } from 'generated/prisma'

import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'

import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface CreateWorkoutUseCaseRequest {
  name: string
  description: string | null
  userId: string
}

interface CreateWorkoutUseCaseResponse {
  workout: Workout
}

export class CreateWorkoutUseCase {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  async execute({
    name,
    description,
    userId,
  }: CreateWorkoutUseCaseRequest): Promise<CreateWorkoutUseCaseResponse> {
    let workout: Workout
    try {
      workout = await this.workoutsRepository.create({
        name,
        description: description ?? null,
        user: { connect: { id: userId } },
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
