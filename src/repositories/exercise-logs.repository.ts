import { Exercise, ExerciseLog, Prisma } from '@prisma/client'

export interface ExerciseLogsRepository {
  create(data: Prisma.ExerciseLogCreateInput): Promise<ExerciseLog>

  update(id: string, data: Prisma.ExerciseLogUpdateInput): Promise<ExerciseLog>

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

  findByExerciseSession(exerciseSessionId: string): Promise<ExerciseLog | null>
}
