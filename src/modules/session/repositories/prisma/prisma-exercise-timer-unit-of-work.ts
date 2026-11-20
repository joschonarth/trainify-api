import { prisma } from '@/lib/prisma'
import type {
  ExerciseTimerRepositories,
  ExerciseTimerUnitOfWork,
} from '../exercise-timer-unit-of-work'
import { PrismaExerciseSessionsRepository } from './prisma-exercise-sessions.repository'
import { PrismaWorkoutSessionsRepository } from './prisma-workout-sessions.repository'

export class PrismaExerciseTimerUnitOfWork implements ExerciseTimerUnitOfWork {
  async execute<T>(
    exerciseSessionId: string,
    operation: (repositories: ExerciseTimerRepositories) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async (transaction) => {
      // Serialize timers with each other and with session finalization.
      await transaction.$queryRaw`SELECT ws.id FROM workout_sessions ws
        JOIN exercise_sessions es ON es."workoutSessionId" = ws.id
        WHERE es.id = ${exerciseSessionId} FOR UPDATE OF ws`
      await transaction.$queryRaw`SELECT id FROM exercise_sessions
        WHERE "workoutSessionId" = (SELECT "workoutSessionId" FROM exercise_sessions WHERE id = ${exerciseSessionId})
        ORDER BY id FOR UPDATE`
      const exerciseSessions = new PrismaExerciseSessionsRepository(transaction)
      const workoutSessions = new PrismaWorkoutSessionsRepository(transaction)
      return await operation({ exerciseSessions, workoutSessions })
    })
  }
}
