import type { Exercise, MyExercise, Prisma } from 'generated/prisma'

export interface MyExercisesRepository {
  setFavorite(
    userId: string,
    exerciseId: string,
    isFavorite: boolean
  ): Promise<MyExercise | null>
  createCustomExerciseWithLibraryEntry(
    userId: string,
    data: Omit<Prisma.ExerciseCreateInput, 'user'>
  ): Promise<Exercise>
  archiveCustomExercise(userId: string, exerciseId: string): Promise<void>
  addExercise(userId: string, exerciseId: string): Promise<MyExercise>
  findByUserAndExercise(
    userId: string,
    exerciseId: string
  ): Promise<MyExercise | null>
  findAllByUser(
    userId: string,
    q: string,
    category: Exercise['category'] | null,
    page: number,
    pageSize: number,
    type?: Exercise['type'] | null,
    isFavorite?: boolean
  ): Promise<{
    items: (MyExercise & { exercise: Exercise })[]
    total: number
  }>
  findById(id: string): Promise<MyExercise | null>
  deleteById(id: string): Promise<void>
}
