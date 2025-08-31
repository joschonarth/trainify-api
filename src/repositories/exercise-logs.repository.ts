import { Exercise, ExerciseLog, Prisma } from '@prisma/client'

export interface ExerciseLogsRepository {
  create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog>

  findAllByUser(userId: string): Promise<
    (ExerciseLog & {
      exercise: {
        id: string
        name: string
        category: Exercise['category'] | null
        type: Exercise['type'] | null
      }
    })[]
  >

  findByUserAndExerciseBetweenDates(
    userId: string,
    exerciseId: string,
    start: Date,
    end: Date,
  ): Promise<ExerciseLog | null>

  findById(id: string): Promise<
    | (ExerciseLog & {
        exercise: {
          id: string
          name: string
          category: Exercise['category'] | null
          type: Exercise['type'] | null
        }
      })
    | null
  >
}
