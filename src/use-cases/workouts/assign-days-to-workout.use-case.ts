import { ResourceAlreadyExistsError } from '@/errors/resource-already-exists.error'
import { WorkoutSchedulesRepository } from '@/repositories/workout-schedules.repository'

interface AssignDaysToWorkoutUseCaseRequest {
  workoutId: string
  daysOfWeek: number[]
}

interface AssignDaysToWorkoutUseCaseResponse {
  days: number[]
}

export class AssignDaysToWorkoutUseCase {
  constructor(private workoutSchedulesRepository: WorkoutSchedulesRepository) {}

  async execute({
    workoutId,
    daysOfWeek,
  }: AssignDaysToWorkoutUseCaseRequest): Promise<AssignDaysToWorkoutUseCaseResponse> {
    const existingDays =
      await this.workoutSchedulesRepository.findDaysByWorkout(workoutId)
    const existingDaysSet = new Set(existingDays.map((d) => d.dayOfWeek))

    const duplicateDays = daysOfWeek.filter((day) => existingDaysSet.has(day))

    if (duplicateDays.length > 0) {
      throw new ResourceAlreadyExistsError(
        `Workout already has schedule for day(s): ${duplicateDays.join(', ')}`,
      )
    }

    const newDays = daysOfWeek.map((day) => ({
      workoutId,
      dayOfWeek: day,
    }))

    await this.workoutSchedulesRepository.assignDaysToWorkout(newDays)

    return { days: daysOfWeek }
  }
}
