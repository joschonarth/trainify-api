import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import {
  WorkoutsRepository,
  WorkoutWithDetails,
} from '@/repositories/workouts.repository'

interface GetWorkoutDetailsUseCaseRequest {
  workoutId: string
}

interface GetWorkoutDetailsUseCaseResponse {
  workout: WorkoutWithDetails
}

export class GetWorkoutDetailsUseCase {
  constructor(private workoutsRepository: WorkoutsRepository) {}

  async execute({
    workoutId,
  }: GetWorkoutDetailsUseCaseRequest): Promise<GetWorkoutDetailsUseCaseResponse> {
    const workout = await this.workoutsRepository.findByIdWithDetails(workoutId)

    if (!workout) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    return { workout }
  }
}
