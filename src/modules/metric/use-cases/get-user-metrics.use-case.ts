import type { ExerciseSessionsRepository } from '@/modules/session/repositories/exercise-sessions.repository'
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
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'countCompletedByUser' | 'findAllByUser'
    >,
    private readonly exerciseSessionsRepository: Pick<
      ExerciseSessionsRepository,
      'countCompletedByUser'
    >
  ) {}

  async execute({
    userId,
  }: GetUserMetricsRequest): Promise<GetUserMetricsResponse> {
    const [totalWorkouts, totalExercises, sessions] = await Promise.all([
      this.workoutSessionsRepository.countCompletedByUser(userId),
      this.exerciseSessionsRepository.countCompletedByUser(userId),
      this.workoutSessionsRepository.findAllByUser(userId),
    ])

    const totalWorkoutDuration = sessions.reduce(
      (acc, s) => acc + (s.duration ?? 0),
      0
    )

    return { totalWorkouts, totalExercises, totalWorkoutDuration }
  }
}
