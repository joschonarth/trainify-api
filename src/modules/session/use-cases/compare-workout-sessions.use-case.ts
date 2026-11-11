import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { calculateVolume } from '@/shared/utils/calculate-volume'

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
  totalExercises: number
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

    const sorted = [...sessions].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    )

    const [last, previous] = sorted

    if (!(last && previous)) {
      throw new ResourceNotFoundError(
        'Not enough sessions to compare this workout.'
      )
    }

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
        totalExercises: session.exerciseSessions.filter(
          (exerciseSession) => exerciseSession.completed
        ).length,
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
        totalVolume += calculateVolume(
          exercise.sets,
          exercise.reps,
          exercise.weight
        )
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
      totalExercises: currentData.totalExercises,
    }

    const previousSession: SessionSummary = {
      id: prevData.id,
      date: prevData.date.toISOString(),
      totalSets: prev.totalSets,
      totalReps: prev.totalReps,
      totalWeight: prev.totalWeight,
      totalVolume: prev.totalVolume,
      totalExercises: prevData.totalExercises,
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
