import type { WorkoutSessionsRepository } from '@/modules/session/repositories/workout-sessions.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'
import { getLogVolume } from '@/shared/utils/calculate-volume'

import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface GetWorkoutStatsRequest {
  userId: string
  workoutId: string
}

export class GetWorkoutStatsUseCase {
  constructor(
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly workoutSessionsRepository: WorkoutSessionsRepository
  ) {}

  async execute({ userId, workoutId }: GetWorkoutStatsRequest) {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const sessions =
      await this.workoutSessionsRepository.findManyByWorkoutAndUser(
        userId,
        workoutId
      )

    const completedSessions = sessions.filter(
      (session) => session.status === 'COMPLETED'
    )
    const totalSessions = completedSessions.length

    const sessionsStats = completedSessions.map((session) => {
      const totalVolume = session.exerciseSessions.reduce((sum, ex) => {
        const exerciseVolume = ex.logs.reduce(
          (acc, log) => acc + getLogVolume(log, ex.exercise.measurement),
          0
        )
        return sum + exerciseVolume
      }, 0)

      const totalExercises = session.exerciseSessions.filter(
        (exerciseSession) => exerciseSession.completed
      ).length

      return {
        id: session.id,
        date: session.date.toISOString(),
        totalExercises,
        totalVolume,
      }
    })

    const totalVolume = sessionsStats.reduce((sum, s) => sum + s.totalVolume, 0)
    const avgVolume = totalSessions === 0 ? 0 : totalVolume / totalSessions
    const totalExercises = sessionsStats.reduce(
      (sum, s) => sum + s.totalExercises,
      0
    )

    const highestVolumeSession =
      sessionsStats.length === 0
        ? null
        : sessionsStats.reduce((prev, curr) =>
            curr.totalVolume > prev.totalVolume ? curr : prev
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
