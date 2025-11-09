import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'

interface CompareWeeklyWorkoutsRequest {
  userId: string
}

interface WeekSummary {
  start: string
  end: string
  totalWorkouts: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalVolume: number
}

interface WeekDifferences {
  setsDiff: number
  repsDiff: number
  weightDiff: number
  volumeDiff: number
  percentageVolumeChange: number
}

interface WeeklyComparisonResult {
  userId: string
  currentWeek: WeekSummary
  previousWeek: WeekSummary
  differences: WeekDifferences
}

export class CompareWeeklyWorkoutsUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({
    userId,
  }: CompareWeeklyWorkoutsRequest): Promise<WeeklyComparisonResult> {
    const today = new Date()
    const dayOfWeek = today.getDay() || 7
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - dayOfWeek + 1)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)

    const prevStart = new Date(startDate)
    prevStart.setDate(startDate.getDate() - 7)
    const prevEnd = new Date(endDate)
    prevEnd.setDate(endDate.getDate() - 7)

    const currentWeekSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        startDate,
        endDate,
      )
    const previousWeekSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        prevStart,
        prevEnd,
      )

    if (!currentWeekSessions.length || !previousWeekSessions.length) {
      throw new ResourceNotFoundError('Not enough sessions to compare weeks.')
    }

    const calculateMetrics = (
      sessions: WorkoutSessionWithWorkout[],
    ): Omit<WeekSummary, 'start' | 'end' | 'totalWorkouts'> => {
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

    const current = calculateMetrics(currentWeekSessions)
    const previous = calculateMetrics(previousWeekSessions)

    const differences: WeekDifferences = {
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
      currentWeek: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        totalWorkouts: currentWeekSessions.length,
        ...current,
      },
      previousWeek: {
        start: prevStart.toISOString(),
        end: prevEnd.toISOString(),
        totalWorkouts: previousWeekSessions.length,
        ...previous,
      },
      differences,
    }
  }
}
