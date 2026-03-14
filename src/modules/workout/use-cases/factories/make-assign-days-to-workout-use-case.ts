import { PrismaWorkoutSchedulesRepository } from '../../repositories/prisma/prisma-workout-schedules.repository'
import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { AssignDaysToWorkoutUseCase } from '../assign-days-to-workout.use-case'

export function makeAssignDaysToWorkoutUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutSchedulesRepository = new PrismaWorkoutSchedulesRepository()
  const assignDaysToWorkoutUseCase = new AssignDaysToWorkoutUseCase(
    workoutsRepository,
    workoutSchedulesRepository
  )

  return assignDaysToWorkoutUseCase
}
