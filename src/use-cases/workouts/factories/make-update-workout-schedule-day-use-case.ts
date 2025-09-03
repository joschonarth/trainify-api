import { PrismaWorkoutSchedulesRepository } from '@/repositories/prisma/prisma-workout-schedules.repository'

import { UpdateWorkoutScheduleDayUseCase } from '../update-workout-schedule-day.use-case'

export function makeUpdateWorkoutScheduleDayUseCase() {
  const workoutSchedulesRepository = new PrismaWorkoutSchedulesRepository()
  const useCase = new UpdateWorkoutScheduleDayUseCase(
    workoutSchedulesRepository,
  )

  return useCase
}
