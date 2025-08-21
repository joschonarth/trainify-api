import { MyExercise } from '@prisma/client'

export interface MyExercisesRepository {
  addExercise(userId: string, exerciseId: string): Promise<MyExercise>
  findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<MyExercise | null>
}
