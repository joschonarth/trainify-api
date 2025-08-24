import { Exercise, MyExercise } from '@prisma/client'

export interface MyExercisesRepository {
  addExercise(userId: string, exerciseId: string): Promise<MyExercise>
  findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<MyExercise | null>
  findAllByUser(
    userId: string,
  ): Promise<(MyExercise & { exercise: Exercise })[]>
  findById(id: string): Promise<MyExercise | null>
  deleteById(id: string): Promise<void>
}
