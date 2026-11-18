import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import type { WorkoutSchedulesRepository } from '@/modules/workout/repositories/workout-schedules.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

interface GetDailyWorkoutSessionRequest {
  userId: string
}

interface GetDailyWorkoutSessionResponse {
  session: WorkoutSessionWithWorkout
}

export class GetDailyWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    private readonly workoutSchedulesRepository: WorkoutSchedulesRepository,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute({
    userId,
  }: GetDailyWorkoutSessionRequest): Promise<GetDailyWorkoutSessionResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const today = new Date()
    const userToday = dayjs(today).tz(user.timezone)

    const existingSession =
      await this.workoutSessionsRepository.findByUserAndDate(
        userId,
        today,
        user.timezone
      )

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
      userToday.day()
    )

    if (!schedule) {
      throw new ResourceNotFoundError('No workout scheduled for today.')
    }

    const { workout } = schedule
    const activeExercises = workout.exercises.filter(
      (workoutExercise) => !workoutExercise.exercise.archivedAt
    )

    if (!activeExercises.length) {
      throw new ResourceNotFoundError(
        'The scheduled workout has no active exercises.'
      )
    }

    const newSession = await this.workoutSessionsRepository.create({
      userId,
      workoutId: workout.id,
      date: today,
      status: 'PENDING',
      exerciseSessions: {
        create: activeExercises.map((we) => ({
          exerciseId: we.exercise.id,
          position: we.position,
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
