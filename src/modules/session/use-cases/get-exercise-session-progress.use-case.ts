import dayjs from 'dayjs'

import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { ExerciseSessionsRepository } from '../repositories/exercise-sessions.repository'

interface GetExerciseSessionProgressRequest {
  userId: string
  exerciseId: string
  period?: 'WEEK' | 'MONTH' | 'ALL'
}

export class GetExerciseSessionProgressUseCase {
  constructor(private exerciseSessionsRepository: ExerciseSessionsRepository) {}

  async execute({
    userId,
    exerciseId,
    period,
  }: GetExerciseSessionProgressRequest) {
    let fromDate: Date | undefined
    if (period === 'WEEK') {
      fromDate = dayjs().subtract(7, 'day').toDate()
    } else if (period === 'MONTH') {
      fromDate = dayjs().subtract(30, 'day').toDate()
    }

    const sessions =
      await this.exerciseSessionsRepository.findManyByUserAndExercise(
        userId,
        exerciseId,
        fromDate
      )

    if (!sessions || sessions.length === 0) {
      throw new ResourceNotFoundError('No sessions found for this exercise.')
    }

    const progress = sessions.map((session) => {
      const totalVolume = session.logs.reduce(
        (sum, log) =>
          sum + (log.volume ?? log.sets * log.reps * (log.weight ?? 0)),
        0
      )
      const totalSets = session.logs.reduce((sum, log) => sum + log.sets, 0)
      const totalReps = session.logs.reduce((sum, log) => sum + log.reps, 0)
      const totalWeight = session.logs.reduce(
        (sum, log) => sum + (log.weight ?? 0),
        0
      )

      return {
        sessionId: session.id,
        date: session.startedAt ?? session.endedAt ?? null,
        duration: session.duration ?? 0,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        totalVolume,
        totalSets,
        totalReps,
        totalWeight,
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
    const setsArr = progress.map((p) => p.totalSets)
    const repsArr = progress.map((p) => p.totalReps)
    const weightsArr = progress.map((p) => p.totalWeight)
    const durations = progress.map((p) => p.duration)

    return {
      exerciseId,
      exerciseName: sessions[0]!.exercise.name,
      totalSessions: sessions.length,

      // Volume
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      maxVolume: Math.max(...volumes),

      // Sets
      totalSets: setsArr.reduce((a, b) => a + b, 0),
      avgSets: setsArr.reduce((a, b) => a + b, 0) / setsArr.length,
      maxSets: Math.max(...setsArr),

      // Reps
      totalReps: repsArr.reduce((a, b) => a + b, 0),
      avgReps: repsArr.reduce((a, b) => a + b, 0) / repsArr.length,
      maxReps: Math.max(...repsArr),

      // Weight
      totalWeight: weightsArr.reduce((a, b) => a + b, 0),
      avgWeight: weightsArr.reduce((a, b) => a + b, 0) / weightsArr.length,
      maxWeight: Math.max(...weightsArr),

      // Duration
      totalDuration: durations.reduce((a, b) => a + b, 0),
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,

      progress,
    }
  }
}
