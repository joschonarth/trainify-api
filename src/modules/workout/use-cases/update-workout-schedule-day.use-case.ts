import { ResourceAlreadyExistsError } from '@/shared/errors/resource-already-exists.error'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'

interface UpdateWorkoutScheduleDayUseCaseRequest {
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
  constructor(private workoutSchedulesRepository: WorkoutSchedulesRepository) {}

  async execute({
    workoutId,
    scheduleId,
    newDayOfWeek,
  }: UpdateWorkoutScheduleDayUseCaseRequest): Promise<UpdateWorkoutScheduleDayUseCaseResponse> {
    const schedule = await this.workoutSchedulesRepository.findById(scheduleId)
    if (!schedule || schedule.workoutId !== workoutId) {
      throw new ResourceNotFoundError('Schedule not found for this workout.')
    }

    const existingDays =
      await this.workoutSchedulesRepository.findDaysByWorkout(workoutId)
    if (
      existingDays.some(
        (d) => d.dayOfWeek === newDayOfWeek && d.id !== scheduleId,
      )
    ) {
      throw new ResourceAlreadyExistsError(
        `Workout already has schedule for day ${newDayOfWeek}`,
      )
    }

    const updatedSchedule = await this.workoutSchedulesRepository.updateDay(
      scheduleId,
      newDayOfWeek,
    )

    return { schedule: updatedSchedule }
  }
}
