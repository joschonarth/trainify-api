import { PrismaWorkoutSchedulesRepository } from '@/repositories/prisma/prisma-workout-schedules.repository'

import { AssignDaysToWorkoutUseCase } from '../assign-days-to-workout.use-case'

export function makeAssignDaysToWorkoutUseCase() {
  const workoutSchedulesRepository = new PrismaWorkoutSchedulesRepository()
  const useCase = new AssignDaysToWorkoutUseCase(workoutSchedulesRepository)

  return useCase
}
