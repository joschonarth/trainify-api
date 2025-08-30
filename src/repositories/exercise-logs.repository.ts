import { ExerciseLog, Prisma } from '@prisma/client'

export interface ExerciseLogsRepository {
  create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog>

  findAllByUser(userId: string): Promise<
    (ExerciseLog & {
      exercise: {
        id: string
        name: string
        category: string | null
        type: string | null
      }
    })[]
  >
  findByUserAndExerciseBetweenDates(
    userId: string,
    exerciseId: string,
    start: Date,
    end: Date,
  ): Promise<ExerciseLog | null>
}
