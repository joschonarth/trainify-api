import type { WorkoutSchedule } from 'generated/prisma'

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
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly workoutSchedulesRepository: WorkoutSchedulesRepository
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
