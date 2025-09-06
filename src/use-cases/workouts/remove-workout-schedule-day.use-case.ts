import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutSchedulesRepository } from '@/repositories/workout-schedules.repository'

interface RemoveWorkoutScheduleDayUseCaseRequest {
  workoutId: string
  scheduleId: string
}

export class RemoveWorkoutScheduleDayUseCase {
  constructor(private workoutSchedulesRepository: WorkoutSchedulesRepository) {}

  async execute({
    workoutId,
    scheduleId,
  }: RemoveWorkoutScheduleDayUseCaseRequest) {
    const schedule = await this.workoutSchedulesRepository.findById(scheduleId)

    if (!schedule || schedule.workoutId !== workoutId) {
      throw new ResourceNotFoundError('Schedule not found for this workout.')
    }

    await this.workoutSchedulesRepository.delete(scheduleId)
  }
}
