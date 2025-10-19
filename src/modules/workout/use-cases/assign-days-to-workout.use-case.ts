import { WorkoutSchedulesRepository } from '../repositories/workout-schedules.repository'

interface AssignDaysToWorkoutUseCaseRequest {
  workoutId: string
  daysOfWeek: number[]
}

interface AssignDaysToWorkoutUseCaseResponse {
  assignedDays: number[]
}

export class AssignDaysToWorkoutUseCase {
  constructor(private workoutSchedulesRepository: WorkoutSchedulesRepository) {}

  async execute({
    workoutId,
    daysOfWeek,
  }: AssignDaysToWorkoutUseCaseRequest): Promise<AssignDaysToWorkoutUseCaseResponse> {
    const existingDays =
      await this.workoutSchedulesRepository.findDaysByWorkout(workoutId)

    for (const day of existingDays) {
      await this.workoutSchedulesRepository.delete(day.id)
    }

    const newDays = daysOfWeek.map((day) => ({
      workoutId,
      dayOfWeek: day,
    }))

    await this.workoutSchedulesRepository.assignDaysToWorkout(newDays)

    return { assignedDays: daysOfWeek }
  }
}
