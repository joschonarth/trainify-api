import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type {
  WorkoutsRepository,
  WorkoutWithDetails,
} from '../repositories/workouts.repository'

interface GetWorkoutDetailsUseCaseRequest {
  workoutId: string
  userId: string
}

interface GetWorkoutDetailsUseCaseResponse {
  workout: WorkoutWithDetails
}

export class GetWorkoutDetailsUseCase {
  constructor(private readonly workoutsRepository: WorkoutsRepository) {}

  async execute({
    workoutId,
    userId,
  }: GetWorkoutDetailsUseCaseRequest): Promise<GetWorkoutDetailsUseCaseResponse> {
    const workout = await this.workoutsRepository.findByIdWithDetails(workoutId)

    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    return { workout }
  }
}
