import type { Prisma, WorkoutExercise } from '@prisma/client'

export interface WorkoutExercisesRepository {
  findById(id: string): Promise<WorkoutExercise | null>

  findByWorkout(workoutId: string): Promise<
    (WorkoutExercise & {
      exercise: {
        id: string
        name: string
        category: string | null
        type: string | null
      }
    })[]
  >

  findByWorkoutAndExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<WorkoutExercise | null>

  addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput
  ): Promise<WorkoutExercise>

  updateDefaults(
    workoutExerciseId: string,
    data: {
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
    }
  ): Promise<WorkoutExercise>

  removeExerciseFromWorkout(workoutExerciseId: string): Promise<void>
}
