import { ExerciseLogsRepository } from '@/repositories/exercise-logs.repository'
import { WorkoutSessionsRepository } from '@/repositories/workout-sessions.repository'

interface GetUserMetricsRequest {
  userId: string
}

interface GetUserMetricsResponse {
  totalWorkouts: number
  totalExercises: number
}

export class GetUserMetricsUseCase {
  constructor(
    private workoutSessionsRepository: WorkoutSessionsRepository,
    private exerciseLogsRepository: ExerciseLogsRepository,
  ) {}

  async execute({
    userId,
  }: GetUserMetricsRequest): Promise<GetUserMetricsResponse> {
    const [totalWorkouts, totalExercises] = await Promise.all([
      this.workoutSessionsRepository.countCompletedByUser(userId),
      this.exerciseLogsRepository.countCompletedByUser(userId),
    ])

    return { totalWorkouts, totalExercises }
  }
}
