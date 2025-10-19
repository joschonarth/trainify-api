import { PrismaWorkoutSessionsRepository } from '@/modules/session/repositories/prisma/prisma-workout-sessions.repository'

import { GetWorkoutCalendarUseCase } from '../get-workout-calendar.use-case'

export function makeGetWorkoutCalendarUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const getWorkoutCalendarUseCase = new GetWorkoutCalendarUseCase(
    workoutSessionsRepository,
  )

  return getWorkoutCalendarUseCase
}
