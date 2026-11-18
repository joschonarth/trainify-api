import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import timezonePlugin from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { UsersRepository } from '@/modules/user/repositories/users.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { calculateVolume } from '@/shared/utils/calculate-volume'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'
import { isSessionComparable } from '../utils/is-session-comparable'

dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezonePlugin)

type Period = 'week' | 'month'

interface CompareWorkoutsRequest {
  userId: string
  period?: Period
}

interface PeriodSummary {
  start: string
  end: string
  totalWorkouts: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalVolume: number
}

interface PeriodDifferences {
  setsDiff: number
  repsDiff: number
  weightDiff: number
  volumeDiff: number
  percentageVolumeChange: number
}

interface CompareWorkoutsResult {
  userId: string
  currentPeriod: PeriodSummary
  previousPeriod: PeriodSummary
  differences: PeriodDifferences
}

export class CompareWorkoutsUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    private readonly usersRepository: Pick<UsersRepository, 'findById'>
  ) {}

  async execute({
    userId,
    period = 'week',
  }: CompareWorkoutsRequest): Promise<CompareWorkoutsResult> {
    let startDate: Date
    let endDate: Date
    let prevStart: Date
    let prevEnd: Date

    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError('User not found.')
    }

    const today = dayjs().tz(user.timezone)

    if (period === 'week') {
      const currentWeek = today.startOf('isoWeek')
      const previousWeek = currentWeek.subtract(1, 'week')
      startDate = currentWeek.toDate()
      endDate = currentWeek.endOf('isoWeek').toDate()
      prevStart = previousWeek.toDate()
      prevEnd = previousWeek.endOf('isoWeek').toDate()
    } else {
      const currentMonth = today.startOf('month')
      const previousMonth = currentMonth.subtract(1, 'month')
      startDate = currentMonth.toDate()
      endDate = currentMonth.endOf('month').toDate()
      prevStart = previousMonth.toDate()
      prevEnd = previousMonth.endOf('month').toDate()
    }

    const currentSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        startDate,
        endDate
      )
    const previousSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        prevStart,
        prevEnd
      )

    const comparableCurrentSessions = currentSessions.filter((session) =>
      isSessionComparable(session.status, session.exerciseSessions)
    )
    const comparablePreviousSessions = previousSessions.filter((session) =>
      isSessionComparable(session.status, session.exerciseSessions)
    )

    if (
      !(comparableCurrentSessions.length && comparablePreviousSessions.length)
    ) {
      throw new ResourceNotFoundError(
        `Not enough sessions to compare ${period}s.`
      )
    }

    const calculateMetrics = (
      sessions: WorkoutSessionWithWorkout[]
    ): Omit<PeriodSummary, 'start' | 'end' | 'totalWorkouts'> => {
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
            totalVolume += calculateVolume(sets, reps, weight)
          }
        }
      }

      return { totalSets, totalReps, totalWeight, totalVolume }
    }

    const current = calculateMetrics(comparableCurrentSessions)
    const previous = calculateMetrics(comparablePreviousSessions)

    const differences: PeriodDifferences = {
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
      currentPeriod: {
        start: dayjs(startDate).toISOString(),
        end: dayjs(endDate).toISOString(),
        totalWorkouts: comparableCurrentSessions.length,
        ...current,
      },
      previousPeriod: {
        start: dayjs(prevStart).toISOString(),
        end: dayjs(prevEnd).toISOString(),
        totalWorkouts: comparablePreviousSessions.length,
        ...previous,
      },
      differences,
    }
  }
}
