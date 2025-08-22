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
}
