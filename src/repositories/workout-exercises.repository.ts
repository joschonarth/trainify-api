import { Prisma, WorkoutExercise } from '@prisma/client'

export interface WorkoutExercisesRepository {
  findById(id: string): Promise<WorkoutExercise | null>
  addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput,
  ): Promise<WorkoutExercise>
  updateDefaults(
    workoutExerciseId: string,
    data: {
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
    },
  ): Promise<WorkoutExercise>
  removeExerciseFromWorkout(id: string): Promise<void>
}
