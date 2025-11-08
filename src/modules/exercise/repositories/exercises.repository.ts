import {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  Prisma,
} from '@prisma/client'

export interface ExercisesRepository {
  create(data: Prisma.ExerciseCreateInput): Promise<Exercise>
  findById(id: string): Promise<Exercise | null>
  findAllGlobals(
    query: string,
    category: ExerciseCategory | null,
    page: number,
  ): Promise<Exercise[]>
  findByNameAndUser(name: string, userId: string): Promise<Exercise | null>
  findManyByUser(userId: string): Promise<Exercise[]>
  update(
    exerciseId: string,
    data: Partial<{
      name?: string
      category?: ExerciseCategory | null
      type?: ExerciseType | null
      sets?: number | null
      reps?: number | null
      weight?: number | null
    }>,
  ): Promise<Exercise>
  delete(exerciseId: string): Promise<void>
}
