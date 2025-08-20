import { Exercise, Prisma } from '@prisma/client'

export interface ExercisesRepository {
  create(data: Prisma.ExerciseCreateInput): Promise<Exercise>
  findAllGlobals(
    query: string,
    category: string,
    page: number,
  ): Promise<Exercise[]>
}
