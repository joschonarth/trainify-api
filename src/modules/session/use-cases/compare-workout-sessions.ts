import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'

interface CompareWorkoutSessionsRequest {
  userId: string
  workoutId: string
}

interface SessionSummary {
  id: string
  date: string
  totalSets: number
  totalReps: number
  totalWeight: number
  totalVolume: number
  totalExercises: number
}

interface ComparisonResult {
  differenceInSets: number
  differenceInReps: number
  differenceInWeight: number
  differenceInVolume: number
  percentageVolumeChange: number
  lastSession: SessionSummary
  previousSession: SessionSummary
}

interface ExerciseData {
  sets: number
  reps: number
  weight: number
}

interface WorkoutSessionData {
  id: string
  date: Date
  exercises: ExerciseData[]
}

interface MetricsResult {
  totalSets: number
  totalReps: number
  totalWeight: number
  totalVolume: number
}

export class CompareWorkoutSessionsUseCase {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionsRepository
  ) {}

  async execute({
    userId,
    workoutId,
  }: CompareWorkoutSessionsRequest): Promise<ComparisonResult> {
    const sessions =
      await this.workoutSessionRepository.findManyByWorkoutAndUser(
        userId,
        workoutId
      )

    if (!sessions || sessions.length < 2) {
      throw new ResourceNotFoundError(
        'Not enough sessions to compare this workout.'
      )
    }

    const sorted = [...sessions].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    )

    const last = sorted[0]!
    const previous = sorted[1]!

    const mapToWorkoutSessionData = (
      session: WorkoutSessionWithWorkout
    ): WorkoutSessionData => {
      const exercises: ExerciseData[] = session.exerciseSessions.flatMap(
        (exerciseSession) =>
          exerciseSession.logs.map((log) => ({
            sets: log.sets,
            reps: log.reps,
            weight: log.weight ?? 0,
          }))
      )

      return {
        id: session.id,
        date: session.date,
        exercises,
      }
    }

    const sumMetrics = (session: WorkoutSessionData): MetricsResult => {
      let totalSets = 0
      let totalReps = 0
      let totalWeight = 0
      let totalVolume = 0

      for (const exercise of session.exercises) {
        totalSets += exercise.sets
        totalReps += exercise.reps
        totalWeight += exercise.weight
        totalVolume += exercise.sets * exercise.reps * exercise.weight
      }

      return { totalSets, totalReps, totalWeight, totalVolume }
    }

    const currentData = mapToWorkoutSessionData(last)
    const prevData = mapToWorkoutSessionData(previous)

    const current = sumMetrics(currentData)
    const prev = sumMetrics(prevData)

    const differenceInSets = current.totalSets - prev.totalSets
    const differenceInReps = current.totalReps - prev.totalReps
    const differenceInWeight = current.totalWeight - prev.totalWeight
    const differenceInVolume = current.totalVolume - prev.totalVolume

    const percentageVolumeChange =
      prev.totalVolume > 0 ? (differenceInVolume / prev.totalVolume) * 100 : 0

    const lastSession: SessionSummary = {
      id: currentData.id,
      date: currentData.date.toISOString(),
      totalSets: current.totalSets,
      totalReps: current.totalReps,
      totalWeight: current.totalWeight,
      totalVolume: current.totalVolume,
      totalExercises: currentData.exercises.length,
    }

    const previousSession: SessionSummary = {
      id: prevData.id,
      date: prevData.date.toISOString(),
      totalSets: prev.totalSets,
      totalReps: prev.totalReps,
      totalWeight: prev.totalWeight,
      totalVolume: prev.totalVolume,
      totalExercises: prevData.exercises.length,
    }

    return {
      differenceInSets,
      differenceInReps,
      differenceInWeight,
      differenceInVolume,
      percentageVolumeChange,
      lastSession,
      previousSession,
    }
  }
}
