import { ExerciseLog, Prisma } from '@prisma/client'

export interface ExerciseLogsRepository {
  create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog>
  findByUserAndExerciseBetweenDates(
    userId: string,
    exerciseId: string,
    start: Date,
    end: Date,
  ): Promise<ExerciseLog | null>
}
