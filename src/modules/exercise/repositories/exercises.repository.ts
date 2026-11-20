import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  Prisma,
} from 'generated/prisma'

export interface ExercisesRepository {
  create(data: Prisma.ExerciseCreateInput): Promise<Exercise>
  findById(id: string, includeArchived?: boolean): Promise<Exercise | null>
  findAllGlobals(
    query: string,
    category: ExerciseCategory | null,
    page: number
  ): Promise<Exercise[]>
  findGlobalById(
    id: string,
    includeArchived?: boolean
  ): Promise<Exercise | null>
  findAllGlobalsForAdmin(options: {
    query: string
    category: ExerciseCategory | null
    status: 'active' | 'archived' | 'all'
    page: number
  }): Promise<Exercise[]>
  findGlobalByName(name: string, excludeId?: string): Promise<Exercise | null>
  setGlobalArchived(exerciseId: string, archived: boolean): Promise<boolean>
  findByNameAndUser(
    name: string,
    userId: string,
    excludeExerciseId?: string,
    includeArchived?: boolean
  ): Promise<Exercise | null>
  update(
    exerciseId: string,
    data: Partial<{
      name?: string
      category?: ExerciseCategory | null
      type?: ExerciseType | null
    }>
  ): Promise<Exercise>
  archive(exerciseId: string): Promise<void>
  deleteUnlinked(exerciseId: string): Promise<void>
}
