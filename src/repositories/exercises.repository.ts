import { Exercise, Prisma } from '@prisma/client'

export interface ExercisesRepository {
  create(data: Prisma.ExerciseCreateInput): Promise<Exercise>
  findById(id: string): Promise<Exercise | null>
  findAllGlobals(
    query: string,
    category: string,
    page: number,
  ): Promise<Exercise[]>
  findByNameAndUser(name: string, userId: string): Promise<Exercise | null>
  update(
    exerciseId: string,
    data: Partial<{
      name?: string
      category?: string | null
      type?: string | null
      sets?: number | null
      reps?: number | null
      weight?: number | null
    }>,
  ): Promise<Exercise>
  delete(exerciseId: string): Promise<void>
}
