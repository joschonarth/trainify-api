import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { GetMonthlyWorkoutCalendarUseCase } from '../get-monthly-workout-calendar.use-case'

export function makeGetMonthlyWorkoutCalendarUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const getMonthlyWorkoutCalendarUseCase = new GetMonthlyWorkoutCalendarUseCase(
    workoutSessionsRepository,
  )

  return getMonthlyWorkoutCalendarUseCase
}
