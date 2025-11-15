import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { StartWorkoutSessionUseCase } from '../start-workout-session.use-case'

export function makeStartWorkoutSessionUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const startWorkoutSessionUseCase = new StartWorkoutSessionUseCase(
    workoutSessionsRepository,
  )

  return startWorkoutSessionUseCase
}
