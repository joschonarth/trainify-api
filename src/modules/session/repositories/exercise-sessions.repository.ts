import { ExerciseSession, Prisma } from '@prisma/client'

export type ExerciseSessionWithLogs = ExerciseSession & {
  exercise: {
    id: string
    name: string
    category: string | null
    type: string | null
    sets: number | null
    reps: number | null
    weight: number | null
  }
  logs: {
    id: string
    sets: number
    reps: number
    weight: number | null
    date: Date
    description: string | null
  }[]
}

export interface ExerciseSessionsRepository {
  findById(id: string): Promise<ExerciseSession | null>

  findBySessionId(sessionId: string): Promise<ExerciseSessionWithLogs[]>

  findByWorkoutSessionId(
    workoutSessionId: string,
  ): Promise<ExerciseSessionWithLogs[]>

  findByIdWithLogs(id: string): Promise<ExerciseSessionWithLogs | null>

  create(
    data: Prisma.ExerciseSessionUncheckedCreateInput,
  ): Promise<ExerciseSession>

  update(
    id: string,
    data: Prisma.ExerciseSessionUncheckedUpdateInput,
  ): Promise<ExerciseSession>

  delete(id: string): Promise<void>
}
