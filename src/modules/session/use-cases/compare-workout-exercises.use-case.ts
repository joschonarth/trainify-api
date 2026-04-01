import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'

interface CompareWorkoutExercisesRequest {
  userId: string
  workoutId: string
}

interface ExerciseProgress {
  exercise: string
  sessions: {
    date: string
    sets: number
    weight: number
    reps: number
    volume: number
  }[]
  progress: {
    setsDiff: number
    weightDiff: number
    repsDiff: number
    volumeDiff: number
  }
}

interface CompareWorkoutExercisesResponse {
  workoutId: string
  progress: ExerciseProgress[]
}

export class CompareWorkoutExercisesUseCase {
  constructor(
    private readonly workoutSessionRepository: WorkoutSessionsRepository
  ) {}

  async execute({
    userId,
    workoutId,
  }: CompareWorkoutExercisesRequest): Promise<CompareWorkoutExercisesResponse> {
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

    const mapExercises = (
      session: WorkoutSessionWithWorkout
    ): Record<
      string,
      { sets: number; weight: number; reps: number; volume: number }
    > => {
      const result: Record<
        string,
        { sets: number; weight: number; reps: number; volume: number }
      > = {}

      for (const exerciseSession of session.exerciseSessions) {
        const exerciseName = exerciseSession.exercise.name
        const logs = exerciseSession.logs

        if (!logs.length) {
          continue
        }

        const avgWeight =
          logs.reduce((acc, log) => acc + (log.weight ?? 0), 0) / logs.length
        const avgReps =
          logs.reduce((acc, log) => acc + log.reps, 0) / logs.length

        const sets = logs.length

        const volume = sets * avgReps * avgWeight

        result[exerciseName] = {
          sets,
          weight: avgWeight,
          reps: avgReps,
          volume,
        }
      }

      return result
    }

    const lastExercises = mapExercises(last)
    const prevExercises = mapExercises(previous)

    const progress: ExerciseProgress[] = []

    for (const exercise of Object.keys(lastExercises)) {
      const lastData = lastExercises[exercise]
      const prevData = prevExercises[exercise]

      if (!(lastData && prevData)) {
        continue
      }

      progress.push({
        exercise,
        sessions: [
          {
            date: previous.date.toISOString(),
            sets: prevData.sets,
            weight: Number(prevData.weight.toFixed(1)),
            reps: Math.round(prevData.reps),
            volume: Number(prevData.volume.toFixed(1)),
          },
          {
            date: last.date.toISOString(),
            sets: lastData.sets,
            weight: Number(lastData.weight.toFixed(1)),
            reps: Math.round(lastData.reps),
            volume: Number(lastData.volume.toFixed(1)),
          },
        ],
        progress: {
          setsDiff: lastData.sets - prevData.sets,
          weightDiff: Number((lastData.weight - prevData.weight).toFixed(1)),
          repsDiff: Math.round(lastData.reps - prevData.reps),
          volumeDiff: Number((lastData.volume - prevData.volume).toFixed(1)),
        },
      })
    }

    return {
      workoutId,
      progress,
    }
  }
}
