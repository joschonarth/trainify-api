import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'
import { PrismaWorkoutSchedulesRepository } from '@/modules/workout/repositories/prisma/prisma-workout-schedules.repository'

import { GetDailyWorkoutSessionUseCase } from '../get-daily-workout-sessions.use-case'

export function makeGetDailyWorkoutSessionUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const workoutSchedulesRepository = new PrismaWorkoutSchedulesRepository()
  const getDailyWorkoutSessionUseCase = new GetDailyWorkoutSessionUseCase(
    workoutSessionsRepository,
    workoutSchedulesRepository,
  )

  return getDailyWorkoutSessionUseCase
}
