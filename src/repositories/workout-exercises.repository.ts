import { Prisma, WorkoutExercise } from '@prisma/client'

export interface WorkoutExercisesRepository {
  addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput,
  ): Promise<WorkoutExercise>
}
