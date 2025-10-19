import { WorkoutSchedule } from '@prisma/client'

import { ResourceNotFoundError } from '@/errors/resource-not-found.error'

import { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'
import { WorkoutsRepository } from '../repositories/workouts.repository'

interface FetchWorkoutSchedulesUseCaseRequest {
  workoutId: string
}

interface FetchWorkoutSchedulesUseCaseResponse {
  schedules: WorkoutSchedule[]
}

export class FetchWorkoutSchedulesUseCase {
  constructor(
    private workoutsRepository: WorkoutsRepository,
    private workoutSchedulesRepository: WorkoutSchedulesRepository,
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
