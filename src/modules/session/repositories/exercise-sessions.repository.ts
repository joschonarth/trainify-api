import type { ExerciseSession, Prisma } from 'generated/prisma'

import type { exerciseSessionWithLogsInclude } from './includes/exercise-session.include'

export type ExerciseSessionWithLogs = Prisma.ExerciseSessionGetPayload<{
  include: typeof exerciseSessionWithLogsInclude
}>

export interface ExerciseSessionsRepository {
  countCompletedByUser(userId: string): Promise<number>

  findById(id: string): Promise<ExerciseSession | null>

  findBySessionId(sessionId: string): Promise<ExerciseSessionWithLogs[]>

  findByWorkoutSessionId(
    workoutSessionId: string
  ): Promise<ExerciseSessionWithLogs[]>

  findByIdWithLogs(id: string): Promise<ExerciseSessionWithLogs | null>

  findManyByUserAndExercise(
    userId: string,
    exerciseId: string,
    fromDate?: Date
  ): Promise<ExerciseSessionWithLogs[]>

  create(
    data: Prisma.ExerciseSessionUncheckedCreateInput
  ): Promise<ExerciseSession>

  update(
    id: string,
    data: Prisma.ExerciseSessionUncheckedUpdateInput
  ): Promise<ExerciseSession>

  delete(id: string): Promise<void>
}
