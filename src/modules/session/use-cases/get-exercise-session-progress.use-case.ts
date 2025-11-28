import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { ExerciseSessionsRepository } from '../repositories/exercise-sessions.repository'

interface GetExerciseSessionProgressRequest {
  userId: string
  exerciseId: string
}

export class GetExerciseSessionProgressUseCase {
  constructor(private exerciseSessionsRepository: ExerciseSessionsRepository) {}

  async execute({ userId, exerciseId }: GetExerciseSessionProgressRequest) {
    const sessions =
      await this.exerciseSessionsRepository.findManyByUserAndExercise(
        userId,
        exerciseId,
      )

    if (!sessions || sessions.length === 0) {
      throw new ResourceNotFoundError('No sessions found for this exercise.')
    }

    const progress = sessions.map((session) => {
      const totalVolume = session.logs.reduce((sum, log) => {
        const volume = log.volume ?? log.sets * log.reps * (log.weight ?? 0)
        return sum + volume
      }, 0)

      return {
        sessionId: session.id,
        date: session.startedAt ?? session.endedAt ?? null,
        duration: session.duration ?? 0,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        totalVolume,
        logs: session.logs.map((log) => ({
          id: log.id,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          volume: log.volume ?? log.sets * log.reps * (log.weight ?? 0),
          date: log.date,
          description: log.description,
        })),
      }
    })

    const volumes = progress.map((p) => p.totalVolume)
    const durations = progress.map((p) => p.duration)

    return {
      exerciseId,
      exerciseName: sessions[0]!.exercise.name,
      totalSessions: sessions.length,
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      maxVolume: Math.max(...volumes),
      totalDuration: durations.reduce((a, b) => a + b, 0),
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      progress,
    }
  }
}
