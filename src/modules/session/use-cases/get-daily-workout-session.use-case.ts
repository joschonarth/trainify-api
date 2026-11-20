import dayjs from 'dayjs'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { StreakPlansRepository } from '@/modules/gamification/streak/repositories/streak-plans.repository'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '@/modules/session/repositories/workout-sessions.repository'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import type { WorkoutSchedulesRepository } from '@/modules/workout/repositories/workout-schedules.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getZonedDayRange } from '@/shared/utils/date-timezone'

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
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'resolveDailySession'
    >,
    private readonly workoutSchedulesRepository: Pick<
      WorkoutSchedulesRepository,
      'findByUserAndDay'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>,
    private readonly plans?: StreakPlansRepository
  ) {}

  async execute({
    userId,
  }: GetDailyWorkoutSessionRequest): Promise<GetDailyWorkoutSessionResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const plan = await this.plans?.findByUser(userId)
    const today = new Date()
    const timezone =
      plan &&
      dayjs(today).tz(plan.timezone).format('YYYY-MM-DD') >= plan.activationDate
        ? plan.timezone
        : user.timezone
    const userToday = dayjs(today).tz(timezone)

    const dailyRequest = {
      userId,
      businessDate: userToday.format('YYYY-MM-DD'),
      timezone,
      ...getZonedDayRange(today, timezone),
    }
    const existingSession =
      await this.workoutSessionsRepository.resolveDailySession(dailyRequest)
    // Membership, order and planned defaults remain unchanged, including in PENDING.
    // Exercise catalog metadata is read live; it is not part of this snapshot.
    if (existingSession) {
      return { session: existingSession }
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

    const detailedSession =
      await this.workoutSessionsRepository.resolveDailySession(dailyRequest, {
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

    if (!detailedSession) {
      throw new ResourceNotFoundError('Workout session not found.')
    }

    return { session: detailedSession }
  }
}
