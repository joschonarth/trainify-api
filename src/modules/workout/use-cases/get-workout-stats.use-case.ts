import { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import { WorkoutsRepository } from '../repositories/workouts.repository'

interface GetWorkoutStatsRequest {
  userId: string
  workoutId: string
}

export class GetWorkoutStatsUseCase {
  constructor(
    private workoutsRepository: WorkoutsRepository,
    private workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute({ userId, workoutId }: GetWorkoutStatsRequest) {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const sessions =
      await this.workoutSessionsRepository.findManyByWorkoutAndUser(
        userId,
        workoutId,
      )

    if (!sessions || sessions.length === 0) {
      throw new ResourceNotFoundError('No sessions found for this workout.')
    }

    const totalSessions = sessions.length

    const sessionsStats = sessions.map((session) => {
      const totalVolume = session.exerciseSessions.reduce((sum, ex) => {
        const exerciseVolume = ex.logs.reduce(
          (acc, log) => acc + log.sets * log.reps * (log.weight ?? 0),
          0,
        )
        return sum + exerciseVolume
      }, 0)

      const totalExercises = session.exerciseSessions.length

      return {
        id: session.id,
        date: session.date.toISOString(),
        totalExercises,
        totalVolume,
      }
    })

    const totalVolume = sessionsStats.reduce((sum, s) => sum + s.totalVolume, 0)
    const avgVolume = totalVolume / totalSessions
    const totalExercises = sessionsStats.reduce(
      (sum, s) => sum + s.totalExercises,
      0,
    )

    const highestVolumeSession = sessionsStats.reduce((prev, curr) =>
      curr.totalVolume > prev.totalVolume ? curr : prev,
    )

    return {
      workoutId: workout.id,
      workout: workout.name,
      totalSessions,
      totalExercises,
      totalVolume,
      avgVolume,
      highestVolumeSession,
      sessions: sessionsStats,
    }
  }
}
