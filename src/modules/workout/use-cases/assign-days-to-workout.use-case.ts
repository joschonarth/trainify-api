import { NotAllowedError } from '@/shared/errors/not-allowed.error'
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
    private workoutsRepository: WorkoutsRepository,
    private workoutSchedulesRepository: WorkoutSchedulesRepository
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
      throw new NotAllowedError()
    }

    const existingDays =
      await this.workoutSchedulesRepository.findDaysByWorkout(workoutId)

    for (const day of existingDays) {
      await this.workoutSchedulesRepository.delete(day.id)
    }

    const newDays = daysOfWeek.map((day) => ({
      workoutId,
      userId,
      dayOfWeek: day,
    }))

    await this.workoutSchedulesRepository.assignDaysToWorkout(newDays)

    return { assignedDays: daysOfWeek }
  }
}
