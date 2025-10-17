import { PrismaWorkoutSessionsRepository } from '@/repositories/prisma/prisma-workout-sessions.repository'

import { GetWeeklyWorkoutCalendarUseCase } from '../get-weekly-workout-calendar.use-case'

export function makeGetWeeklyWorkoutCalendarUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const getWeeklyWorkoutCalendarUseCase = new GetWeeklyWorkoutCalendarUseCase(
    workoutSessionsRepository,
  )

  return getWeeklyWorkoutCalendarUseCase
}
