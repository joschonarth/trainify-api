import type { WorkoutsRepository } from '@/modules/workout/repositories/workouts.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getLogVolume } from '@/shared/utils/calculate-volume'

import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'
import { getExerciseSessionState } from '../utils/exercise-session-state'

interface GetWorkoutSessionsByWorkoutRequest {
  userId: string
  workoutId: string
}

export class GetWorkoutSessionsByWorkoutUseCase {
  constructor(
    private readonly workoutSessionsRepository: Pick<
      WorkoutSessionsRepository,
      'findManyByWorkoutId'
    >,
    private readonly workoutsRepository: Pick<
      WorkoutsRepository,
      'findByIdIncludingArchived'
    >
  ) {}

  async execute({ userId, workoutId }: GetWorkoutSessionsByWorkoutRequest) {
    const workout =
      await this.workoutsRepository.findByIdIncludingArchived(workoutId)
    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const sessions = await this.workoutSessionsRepository.findManyByWorkoutId(
      workoutId,
      userId
    )

    const formattedSessions = sessions.map((session) => {
      const exerciseSessions = session.exerciseSessions.map((es) => {
        const volume = es.logs.reduce(
          (sum, log) => sum + getLogVolume(log, es.exercise.measurement),
          0
        )

        const latestLog = [...es.logs].sort(
          (a, b) =>
            b.date.getTime() - a.date.getTime() || b.id.localeCompare(a.id)
        )[0]

        return {
          exerciseName: es.exercise.name,
          sets: es.logs.reduce((sum, log) => sum + log.sets, 0),
          reps: es.logs.reduce((sum, log) => sum + log.reps, 0),
          weight: latestLog?.weight ?? 0,
          volume,
          completed: es.completed,
          skipReason: es.skipReason,
          state: getExerciseSessionState(
            es.completed,
            session.endedAt,
            session.status
          ),
        }
      })

      const totalVolume = exerciseSessions.reduce(
        (acc, es) => acc + es.volume,
        0
      )

      return {
        id: session.id,
        date: session.date.toISOString(),
        status: session.status,
        totalVolume,
        exerciseSessions,
      }
    })

    return {
      workoutId,
      workoutName: workout.name,
      totalSessions: sessions.length,
      sessions: formattedSessions,
    }
  }
}
