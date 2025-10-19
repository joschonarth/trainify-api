import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutSchedulesRepository } from '@/modules/workout/repositories/workout-schedules.repository'
import {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/repositories/workout-sessions.repository'

interface GetDailyWorkoutSessionRequest {
  userId: string
}

interface GetDailyWorkoutSessionResponse {
  session: WorkoutSessionWithWorkout
}

export class GetDailyWorkoutSessionUseCase {
  constructor(
    private workoutSessionsRepository: WorkoutSessionsRepository,
    private workoutSchedulesRepository: WorkoutSchedulesRepository,
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
          existingSession.id,
        )

      if (!detailedSession) {
        throw new ResourceNotFoundError(
          'Session found but workout details missing.',
        )
      }

      return { session: detailedSession }
    }

    const dayOfWeek = today.getDay()
    const schedule = await this.workoutSchedulesRepository.findByUserAndDay(
      userId,
      dayOfWeek,
    )

    if (!schedule) {
      throw new ResourceNotFoundError('No workout scheduled for today.')
    }

    const workout = schedule.workout

    const newSession = await this.workoutSessionsRepository.create({
      userId,
      workoutId: workout.id,
      date: today,
      status: 'PENDING',
    })

    const detailedSession =
      await this.workoutSessionsRepository.findByIdWithWorkout(newSession.id)

    if (!detailedSession) {
      throw new ResourceNotFoundError(
        'New session created but workout details missing.',
      )
    }

    return { session: detailedSession }
  }
}
