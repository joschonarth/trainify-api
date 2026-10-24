import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'
import type { WorkoutSchedulesRepository } from '@/modules/workout/repositories/workout-schedules.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface GetDailyWorkoutSessionRequest {
  userId: string
}

interface GetDailyWorkoutSessionResponse {
  session: WorkoutSessionWithWorkout
}

export class GetDailyWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    private readonly workoutSchedulesRepository: WorkoutSchedulesRepository
  ) {}

  async execute({
    userId,
  }: GetDailyWorkoutSessionRequest): Promise<GetDailyWorkoutSessionResponse> {
    const today = new Date()

    const existingSession =
      await this.workoutSessionsRepository.findByUserAndDate(userId, today)

    if (existingSession) {
      const detailedSession =
        await this.workoutSessionsRepository.findByIdWithWorkout(
          existingSession.id
        )

      if (!detailedSession) {
        throw new ResourceNotFoundError('Workout session not found.')
      }

      return { session: detailedSession }
    }

    const schedule = await this.workoutSchedulesRepository.findByUserAndDay(
      userId,
      today.getDay()
    )

    if (!schedule) {
      throw new ResourceNotFoundError('No workout scheduled for today.')
    }

    const { workout } = schedule

    const newSession = await this.workoutSessionsRepository.create({
      userId,
      workoutId: workout.id,
      date: today,
      status: 'PENDING',
      exerciseSessions: {
        create: workout.exercises.map((we) => ({
          exerciseId: we.exercise.id,
          plannedSets: we.defaultSets,
          plannedReps: we.defaultReps,
          plannedWeight: we.defaultWeight,
        })),
      },
    })

    const detailedSession =
      await this.workoutSessionsRepository.findByIdWithWorkout(newSession.id)

    if (!detailedSession) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    return { session: detailedSession }
  }
}
