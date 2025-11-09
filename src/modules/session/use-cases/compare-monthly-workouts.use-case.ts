import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'

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
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({
    userId,
  }: CompareMonthlyWorkoutsRequest): Promise<MonthlyComparisonResult> {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    )

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    )
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    )

    const currentMonthSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        currentMonthStart,
        currentMonthEnd,
      )

    const previousMonthSessions =
      await this.workoutSessionsRepository.findDetailedByUserAndDateRange(
        userId,
        previousMonthStart,
        previousMonthEnd,
      )

    if (!currentMonthSessions.length || !previousMonthSessions.length) {
      throw new ResourceNotFoundError('Not enough sessions to compare months.')
    }

    const calculateMetrics = (sessions: WorkoutSessionWithWorkout[]) => {
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

    const current = calculateMetrics(currentMonthSessions)
    const previous = calculateMetrics(previousMonthSessions)

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
        start: currentMonthStart.toISOString(),
        end: currentMonthEnd.toISOString(),
        totalWorkouts: currentMonthSessions.length,
        ...current,
      },
      previousMonth: {
        start: previousMonthStart.toISOString(),
        end: previousMonthEnd.toISOString(),
        totalWorkouts: previousMonthSessions.length,
        ...previous,
      },
      differences,
    }
  }
}
