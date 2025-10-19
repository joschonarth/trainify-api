import { PrismaWorkoutSchedulesRepository } from '../../repositories/prisma/prisma-workout-schedules.repository'
import { PrismaWorkoutsRepository } from '../../repositories/prisma/prisma-workouts.repository'
import { FetchWorkoutSchedulesUseCase } from '../fetch-workout-schedules.use-case'

export function makeFetchWorkoutSchedulesUseCase() {
  const workoutsRepository = new PrismaWorkoutsRepository()
  const workoutSchedulesRepository = new PrismaWorkoutSchedulesRepository()
  const fetchWorkoutSchedulesUseCase = new FetchWorkoutSchedulesUseCase(
    workoutsRepository,
    workoutSchedulesRepository,
  )

  return fetchWorkoutSchedulesUseCase
}
