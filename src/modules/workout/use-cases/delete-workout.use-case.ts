import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface DeleteWorkoutUseCaseRequest {
  workoutId: string
  userId: string
}

interface DeleteWorkoutUseCaseResponse {
  success: boolean
}

export class DeleteWorkoutUseCase {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  async execute({
    workoutId,
    userId,
  }: DeleteWorkoutUseCaseRequest): Promise<DeleteWorkoutUseCaseResponse> {
    const workout =
      await this.workoutsRepository.findByIdIncludingArchived(workoutId)

    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    if (!workout.archivedAt) {
      await this.workoutsRepository.archive(workoutId)
    }

    return { success: true }
  }
}
