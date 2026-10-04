import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'

interface RemoveWorkoutScheduleDayUseCaseRequest {
  userId: string
  workoutId: string
  scheduleId: string
}

export class RemoveWorkoutScheduleDayUseCase {
  constructor(
    private readonly workoutSchedulesRepository: WorkoutSchedulesRepository
  ) {}

  async execute({
    userId,
    workoutId,
    scheduleId,
  }: RemoveWorkoutScheduleDayUseCaseRequest) {
    const schedule = await this.workoutSchedulesRepository.findById(scheduleId)

    if (!schedule || schedule.workoutId !== workoutId || schedule.userId !== userId) {
      throw new ResourceNotFoundError('Schedule not found for this workout.')
    }

    await this.workoutSchedulesRepository.delete(scheduleId)
  }
}
