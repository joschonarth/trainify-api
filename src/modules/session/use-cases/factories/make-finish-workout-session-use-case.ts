import { PrismaWorkoutSessionsRepository } from '../../repositories/prisma/prisma-workout-sessions.repository'
import { FinishWorkoutSessionUseCase } from '../finish-workout-session.use-case'

export function makeFinishWorkoutSessionUseCase() {
  const workoutSessionsRepository = new PrismaWorkoutSessionsRepository()
  const finishWorkoutSessionUseCase = new FinishWorkoutSessionUseCase(
    workoutSessionsRepository
  )

  return finishWorkoutSessionUseCase
}
