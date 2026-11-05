import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'
import { getExerciseSessionState } from '../utils/exercise-session-state'

interface GetWorkoutSessionsByWorkoutRequest {
  userId: string
  workoutId: string
}

export class GetWorkoutSessionsByWorkoutUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({ userId, workoutId }: GetWorkoutSessionsByWorkoutRequest) {
    const sessions = await this.workoutSessionsRepository.findManyByWorkoutId(
      workoutId,
      userId
    )

    const formattedSessions = sessions.map((session) => {
      const exerciseSessions = session.exerciseSessions.map((es) => {
        const volume = es.logs.reduce(
          (sum, log) =>
            sum + (log.volume ?? log.sets * log.reps * (log.weight ?? 0)),
          0
        )

        return {
          exerciseName: es.exercise.name,
          sets: es.logs.reduce((sum, log) => sum + log.sets, 0),
          reps: es.logs.reduce((sum, log) => sum + log.reps, 0),
          weight: es.logs.reduce((sum, log) => sum + (log.weight ?? 0), 0),
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

    const firstSession = sessions[0]

    if (!firstSession) {
      throw new ResourceNotFoundError(
        'No workout sessions found for this workout.'
      )
    }

    return {
      workoutId,
      workoutName: firstSession.workout.name,
      totalSessions: sessions.length,
      sessions: formattedSessions,
    }
  }
}
