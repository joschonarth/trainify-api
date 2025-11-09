import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { GetWorkoutStatsUseCase } from '../get-workout-stats.use-case'

export function makeGetWorkoutStatsUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()

  const getWorkoutStatsUseCase = new GetWorkoutStatsUseCase(
    workoutsRepository,
    workoutSessionsRepository,
  )

  return getWorkoutStatsUseCase
}
