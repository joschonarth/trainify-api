import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'
import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface AssignDaysToWorkoutUseCaseRequest {
  workoutId: string
  daysOfWeek: number[]
  userId: string
}

interface AssignDaysToWorkoutUseCaseResponse {
  assignedDays: number[]
}

export class AssignDaysToWorkoutUseCase {
  constructor(
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly workoutSchedulesRepository: WorkoutSchedulesRepository
  ) {}

  async execute({
    workoutId,
    daysOfWeek,
    userId,
  }: AssignDaysToWorkoutUseCaseRequest): Promise<AssignDaysToWorkoutUseCaseResponse> {
    const workout = await this.workoutsRepository.findById(workoutId)

    if (!workout) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    if (workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    if (new Set(daysOfWeek).size !== daysOfWeek.length) {
      throw new ResourceAlreadyExistsError('Schedule days must be unique.')
    }
    const otherWorkoutDays =
      await this.workoutSchedulesRepository.findDaysByUser(userId)
    const conflict = otherWorkoutDays.find(
      (schedule) =>
        schedule.workoutId !== workoutId &&
        daysOfWeek.includes(schedule.dayOfWeek)
    )
    if (conflict) {
      throw new ResourceAlreadyExistsError(
        'A workout already uses one of these days.'
      )
    }
    try {
      const replaced =
        await this.workoutSchedulesRepository.replaceDaysForWorkout(
          workoutId,
          userId,
          daysOfWeek
        )
      if (!replaced) {
        throw new ResourceNotFoundError('Workout not found.')
      }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ResourceAlreadyExistsError(
          'A workout already uses one of these days.'
        )
      }
      throw error
    }

    return { assignedDays: daysOfWeek }
  }
}
