import type { Exercise, MyExercise } from 'generated/prisma'

export interface MyExercisesRepository {
  addExercise(userId: string, exerciseId: string): Promise<MyExercise>
  findByUserAndExercise(
    userId: string,
    exerciseId: string
  ): Promise<MyExercise | null>
  findAllByUser(
    userId: string,
    query: string,
    category: Exercise['category'] | null,
    page: number
  ): Promise<(MyExercise & { exercise: Exercise })[]>
  findById(id: string): Promise<MyExercise | null>
  deleteById(id: string): Promise<void>
}
