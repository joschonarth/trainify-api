import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutSessionsRepository } from '../repositories/workout-sessions.repository'

interface GetWorkoutSessionsByWorkoutRequest {
  userId: string
  workoutId: string
}

export class GetWorkoutSessionsByWorkoutUseCase {
  constructor(private workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute({ userId, workoutId }: GetWorkoutSessionsByWorkoutRequest) {
    const sessions = await this.workoutSessionsRepository.findManyByWorkoutId(
      workoutId,
      userId
    )

    if (!sessions || sessions.length === 0) {
      throw new ResourceNotFoundError(
        'No workout sessions found for this workout.'
      )
    }

    const formattedSessions = sessions.map((session) => {
      const exerciseSessions = session.exerciseSessions.map((es) => {
        const plannedSets = es.plannedSets ?? 0
        const plannedReps = es.plannedReps ?? 0
        const plannedWeight = es.plannedWeight ?? 0

        const volume =
          es.logs?.[0]?.volume ?? plannedSets * plannedReps * plannedWeight

        return {
          exerciseName: es.exercise.name,
          sets: plannedSets,
          reps: plannedReps,
          weight: plannedWeight,
          volume,
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

    const firstSession = sessions[0]!

    return {
      workoutId,
      workoutName: firstSession.workout.name,
      totalSessions: sessions.length,
      sessions: formattedSessions,
    }
  }
}
