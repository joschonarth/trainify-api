import type { Workout } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface UpdateWorkoutUseCaseRequest {
  workoutId: string
  name?: string
  description?: string | null
}

interface UpdateWorkoutUseCaseResponse {
  workout: Workout
}

export class UpdateWorkoutUseCase {
  constructor(private workoutsRepository: WorkoutsRepository) {}

  async execute({
    workoutId,
    name,
    description,
  }: UpdateWorkoutUseCaseRequest): Promise<UpdateWorkoutUseCaseResponse> {
    const workoutExists = await this.workoutsRepository.findById(workoutId)
    if (!workoutExists) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const workout = await this.workoutsRepository.update(workoutId, {
      name: name ?? workoutExists.name,
      description: description ?? workoutExists.description,
    })

    return { workout }
  }
}
