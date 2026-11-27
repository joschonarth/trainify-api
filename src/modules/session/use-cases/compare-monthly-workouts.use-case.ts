import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getLogVolume } from '@/shared/utils/calculate-volume'
import { getZonedMonthRangeForDate } from '@/shared/utils/date-timezone'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'
import { isSessionComparable } from '../utils/is-session-comparable'

interface CompareMonthlyWorkoutsRequest {
  userId: string
}

interface MonthSummary {
  start: string
  end: string
  totalWorkouts: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalVolume: number
}

interface MonthDifferences {
  setsDiff: number
  repsDiff: number
  weightDiff: number
  volumeDiff: number
  percentageVolumeChange: number
}

interface MonthlyComparisonResult {
  userId: string
  currentMonth: MonthSummary
  previousMonth: MonthSummary
  differences: MonthDifferences
}

export class CompareMonthlyWorkoutsUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findDetailedByUserAndDateRange'
    >,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute({
    userId,
  }: CompareMonthlyWorkoutsRequest): Promise<MonthlyComparisonResult> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const currentRange = getZonedMonthRangeForDate(new Date(), user.timezone)
    const previousRange = getZonedMonthRangeForDate(
      new Date(currentRange.start.getTime() - 1),
      user.timezone
    )
    const { start: startDate, end: endDate } = currentRange
    const { start: prevStart, end: prevEnd } = previousRange

    const currentMonthSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        startDate,
        endDate,
        user.timezone
      )

    const previousMonthSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        prevStart,
        prevEnd,
        user.timezone
      )

    const comparableCurrentMonthSessions = currentMonthSessions.filter(
      (session) => isSessionComparable(session.status, session.exerciseSessions)
    )
    const comparablePreviousMonthSessions = previousMonthSessions.filter(
      (session) => isSessionComparable(session.status, session.exerciseSessions)
    )

    if (
      !(
        comparableCurrentMonthSessions.length &&
        comparablePreviousMonthSessions.length
      )
    ) {
      throw new ResourceNotFoundError('Not enough sessions to compare months.')
    }

    const calculateMetrics = (
      sessions: WorkoutSessionWithWorkout[]
    ): Omit<MonthSummary, 'start' | 'end' | 'totalWorkouts'> => {
      let totalSets = 0
      let totalReps = 0
      let totalWeight = 0
      let totalVolume = 0

      for (const session of sessions) {
        for (const exerciseSession of session.exerciseSessions) {
          for (const log of exerciseSession.logs) {
            const sets = log.sets ?? 0
            const reps = log.reps ?? 0
            const weight = log.weight ?? 0
            totalSets += sets
            totalReps += reps
            totalWeight += weight
            totalVolume += getLogVolume(
              log,
              exerciseSession.exercise.measurement
            )
          }
        }
      }

      return { totalSets, totalReps, totalWeight, totalVolume }
    }

    const current = calculateMetrics(comparableCurrentMonthSessions)
    const previous = calculateMetrics(comparablePreviousMonthSessions)

    const differences: MonthDifferences = {
      setsDiff: current.totalSets - previous.totalSets,
      repsDiff: current.totalReps - previous.totalReps,
      weightDiff: current.totalWeight - previous.totalWeight,
      volumeDiff: current.totalVolume - previous.totalVolume,
      percentageVolumeChange:
        previous.totalVolume > 0
          ? ((current.totalVolume - previous.totalVolume) /
              previous.totalVolume) *
            100
          : 0,
    }

    return {
      userId,
      currentMonth: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        totalWorkouts: comparableCurrentMonthSessions.length,
        ...current,
      },
      previousMonth: {
        start: prevStart.toISOString(),
        end: prevEnd.toISOString(),
        totalWorkouts: comparablePreviousMonthSessions.length,
        ...previous,
      },
      differences,
    }
  }
}
