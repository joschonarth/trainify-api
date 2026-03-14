import dayjs from 'dayjs'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'

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
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({
    userId,
    period = 'week',
  }: CompareWorkoutsRequest): Promise<CompareWorkoutsResult> {
    let startDate: Date
    let endDate: Date
    let prevStart: Date
    let prevEnd: Date

    const today = dayjs()

    if (period === 'week') {
      startDate = today.startOf('week').add(1, 'day').toDate()
      endDate = today.endOf('week').add(1, 'day').toDate()
      prevStart = today
        .subtract(1, 'week')
        .startOf('week')
        .add(1, 'day')
        .toDate()
      prevEnd = today.subtract(1, 'week').endOf('week').add(1, 'day').toDate()
    } else {
      startDate = today.startOf('month').toDate()
      endDate = today.endOf('month').toDate()
      prevStart = today.subtract(1, 'month').startOf('month').toDate()
      prevEnd = today.subtract(1, 'month').endOf('month').toDate()
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

    if (!(currentSessions.length && previousSessions.length)) {
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
            totalVolume += sets * reps * weight
          }
        }
      }

      return { totalSets, totalReps, totalWeight, totalVolume }
    }

    const current = calculateMetrics(currentSessions)
    const previous = calculateMetrics(previousSessions)

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
        totalWorkouts: currentSessions.length,
        ...current,
      },
      previousPeriod: {
        start: dayjs(prevStart).toISOString(),
        end: dayjs(prevEnd).toISOString(),
        totalWorkouts: previousSessions.length,
        ...previous,
      },
      differences,
    }
  }
}
