import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getLogVolume } from '@/shared/utils/calculate-volume'
import type {
  WorkoutSessionsRepository,
  WorkoutSessionWithWorkout,
} from '../repositories/workout-sessions.repository'
import { isSessionComparable } from '../utils/is-session-comparable'

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
    private readonly workoutSessionRepository: Pick<
      WorkoutSessionsRepository,
      'findManyByWorkoutAndUser'
    >
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

    const sorted = sessions
      .filter((session) =>
        isSessionComparable(session.status, session.exerciseSessions)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime())

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
        const exerciseId = exerciseSession.exercise.id
        const logs = exerciseSession.logs

        if (!logs.length) {
          continue
        }

        const sets = logs.reduce((acc, log) => acc + log.sets, 0)
        const reps = logs.reduce((acc, log) => acc + log.reps, 0) / logs.length
        const weight =
          logs.reduce((acc, log) => acc + (log.weight ?? 0), 0) / logs.length
        const volume = logs.reduce(
          (acc, log) =>
            acc + getLogVolume(log, exerciseSession.exercise.measurement),
          0
        )

        result[exerciseId] = {
          sets,
          weight,
          reps,
          volume,
        }
      }

      return result
    }

    const lastExercises = mapExercises(last)
    const prevExercises = mapExercises(previous)

    const progress: ExerciseProgress[] = []

    for (const exerciseId of Object.keys(lastExercises)) {
      const lastData = lastExercises[exerciseId]
      const prevData = prevExercises[exerciseId]

      if (!(lastData && prevData)) {
        continue
      }

      progress.push({
        exercise:
          last.exerciseSessions.find((item) => item.exercise.id === exerciseId)
            ?.exercise.name ?? exerciseId,
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
