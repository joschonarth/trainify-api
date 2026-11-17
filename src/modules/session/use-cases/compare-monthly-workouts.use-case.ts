import dayjs from 'dayjs'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { calculateVolume } from '@/shared/utils/calculate-volume'
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
    private readonly workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({
    userId,
  }: CompareMonthlyWorkoutsRequest): Promise<MonthlyComparisonResult> {
    const startDate = dayjs().startOf('month').toDate()
    const endDate = dayjs().endOf('month').toDate()
    const prevStart = dayjs(startDate)
      .subtract(1, 'month')
      .startOf('month')
      .toDate()
    const prevEnd = dayjs(startDate)
      .subtract(1, 'month')
      .endOf('month')
      .toDate()

    const currentMonthSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        startDate,
        endDate
      )

    const previousMonthSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        prevStart,
        prevEnd
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
            totalVolume += log.volume || calculateVolume(sets, reps, weight)
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
        start: dayjs(startDate).toISOString(),
        end: dayjs(endDate).toISOString(),
        totalWorkouts: comparableCurrentMonthSessions.length,
        ...current,
      },
      previousMonth: {
        start: dayjs(prevStart).toISOString(),
        end: dayjs(prevEnd).toISOString(),
        totalWorkouts: comparablePreviousMonthSessions.length,
        ...previous,
      },
      differences,
    }
  }
}
