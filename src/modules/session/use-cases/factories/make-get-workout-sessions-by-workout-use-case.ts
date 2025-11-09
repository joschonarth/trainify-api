import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { GetWorkoutSessionsByWorkoutUseCase } from '../get-workout-sessions-by-workout.use-case'

export function makeGetWorkoutSessionsByWorkoutUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const getWorkoutSessionsByWorkoutUseCase =
    new GetWorkoutSessionsByWorkoutUseCase(workoutSessionsRepository)

  return getWorkoutSessionsByWorkoutUseCase
}
