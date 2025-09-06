import { PrismaWorkoutSchedulesRepository } from '@/repositories/prisma/prisma-workout-schedules.repository'

import { RemoveWorkoutScheduleDayUseCase } from '../remove-workout-schedule-day.use-case'

export function makeRemoveWorkoutScheduleDayUseCase() {
  const workoutSchedulesRepository = new PrismaWorkoutSchedulesRepository()
  const useCase = new RemoveWorkoutScheduleDayUseCase(
    workoutSchedulesRepository,
  )

  return useCase
}
