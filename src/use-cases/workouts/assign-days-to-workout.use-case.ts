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
    const data = daysOfWeek.map((day) => ({
      workoutId,
      dayOfWeek: day,
    }))

    await this.workoutSchedulesRepository.assignDaysToWorkout(data)

    return { days: daysOfWeek }
  }
}
