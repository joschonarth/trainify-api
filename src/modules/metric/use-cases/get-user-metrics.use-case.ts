import type { ExerciseLogsRepository } from '@/modules/exercise/repositories/exercise-logs.repository'
import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'

interface GetUserMetricsRequest {
  userId: string
}

interface GetUserMetricsResponse {
  totalWorkouts: number
  totalExercises: number
  totalWorkoutDuration: number
}

export class GetUserMetricsUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    private readonly exerciseLogsRepository: ExerciseLogsRepository
  ) {}

  async execute({
    userId,
  }: GetUserMetricsRequest): Promise<GetUserMetricsResponse> {
    const [totalWorkouts, totalExercises, sessions] = await Promise.all([
      this.workoutSessionsRepository.countCompletedByUser(userId),
      this.exerciseLogsRepository.countCompletedByUser(userId),
      this.workoutSessionsRepository.findAllByUser(userId),
    ])

    const totalWorkoutDuration = sessions.reduce(
      (acc, s) => acc + (s.duration ?? 0),
      0
    )

    return { totalWorkouts, totalExercises, totalWorkoutDuration }
  }
}
