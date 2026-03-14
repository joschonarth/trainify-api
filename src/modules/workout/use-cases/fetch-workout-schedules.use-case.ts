import type { WorkoutSchedule } from '@prisma/client'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'
import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface FetchWorkoutSchedulesUseCaseRequest {
  workoutId: string
}

interface FetchWorkoutSchedulesUseCaseResponse {
  schedules: WorkoutSchedule[]
}

export class FetchWorkoutSchedulesUseCase {
  constructor(
    private workoutsRepository: WorkoutsRepository,
    private workoutSchedulesRepository: WorkoutSchedulesRepository
  ) {}

  async execute({
    workoutId,
  }: FetchWorkoutSchedulesUseCaseRequest): Promise<FetchWorkoutSchedulesUseCaseResponse> {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const schedules =
      await this.workoutSchedulesRepository.findDaysByWorkout(workoutId)

    return { schedules }
  }
}
