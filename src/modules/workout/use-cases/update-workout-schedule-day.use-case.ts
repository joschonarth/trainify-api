import type { WorkoutSchedule } from 'generated/prisma'
import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'

interface UpdateWorkoutScheduleDayUseCaseRequest {
  userId: string
  workoutId: string
  scheduleId: string
  newDayOfWeek: number
}

interface UpdateWorkoutScheduleDayUseCaseResponse {
  schedule: {
    id: string
    workoutId: string
    dayOfWeek: number
  }
}

export class UpdateWorkoutScheduleDayUseCase {
  constructor(
    private readonly workoutSchedulesRepository: WorkoutSchedulesRepository
  ) {}

  async execute({
    userId,
    workoutId,
    scheduleId,
    newDayOfWeek,
  }: UpdateWorkoutScheduleDayUseCaseRequest): Promise<UpdateWorkoutScheduleDayUseCaseResponse> {
    const schedule = await this.workoutSchedulesRepository.findById(scheduleId)
    if (
      !schedule ||
      schedule.workoutId !== workoutId ||
      schedule.userId !== userId
    ) {
      throw new ResourceNotFoundError('Schedule not found for this workout.')
    }

    const existingDays =
      await this.workoutSchedulesRepository.findDaysByUser(userId)
    if (
      existingDays.some(
        (d) => d.workoutId !== workoutId && d.dayOfWeek === newDayOfWeek
      )
    ) {
      throw new ResourceAlreadyExistsError(
        `A workout already uses day ${newDayOfWeek}.`
      )
    }

    let updatedSchedule: WorkoutSchedule | null
    try {
      updatedSchedule = await this.workoutSchedulesRepository.updateDay(
        scheduleId,
        newDayOfWeek
      )
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ResourceAlreadyExistsError(
          `A workout already uses day ${newDayOfWeek}.`
        )
      }
      throw error
    }

    if (!updatedSchedule) {
      throw new ResourceNotFoundError('Schedule not found for this workout.')
    }
    return { schedule: updatedSchedule }
  }
}
