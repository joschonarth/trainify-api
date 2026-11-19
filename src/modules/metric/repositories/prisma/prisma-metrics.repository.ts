import { WorkoutSessionStatus } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type { MetricsRepository, UserMetrics } from '../metrics.repository'

export class PrismaMetricsRepository implements MetricsRepository {
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    const [totalWorkouts, totalExercises, durationAggregate] =
      await Promise.all([
        prisma.workoutSession.count({
          where: {
            userId,
            status: WorkoutSessionStatus.COMPLETED,
          },
        }),
        prisma.exerciseSession.count({
          where: {
            completed: true,
            workoutSession: { userId },
          },
        }),
        prisma.workoutSession.aggregate({
          where: { userId },
          _sum: { duration: true },
        }),
      ])

    return {
      totalWorkouts,
      totalExercises,
      totalWorkoutDuration: durationAggregate._sum.duration ?? 0,
    }
  }
}
