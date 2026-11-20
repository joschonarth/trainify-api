import { PrismaWorkoutsRepository } from '@/modules/workout/repositories/prisma/prisma-workouts.repository'
import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { GetWorkoutSessionsByWorkoutUseCase } from '../get-workout-sessions-by-workout.use-case'

export function makeGetWorkoutSessionsByWorkoutUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const workoutsRepository = new PrismaWorkoutsRepository()
  const getWorkoutSessionsByWorkoutUseCase =
    new GetWorkoutSessionsByWorkoutUseCase(
      workoutSessionsRepository,
      workoutsRepository
    )

  return getWorkoutSessionsByWorkoutUseCase
}
