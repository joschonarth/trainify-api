import type { Exercise, Prisma, WorkoutExercise } from 'generated/prisma'

export interface WorkoutExercisesRepository {
  findById(id: string): Promise<WorkoutExercise | null>

  findByWorkout(workoutId: string): Promise<
    (WorkoutExercise & {
      exercise: {
        id: string
        name: string
        category: Exercise['category'] | null
        type: Exercise['type'] | null
      }
    })[]
  >

  findByWorkoutAndExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<WorkoutExercise | null>

  getNextPosition(workoutId: string): Promise<number>

  removeByExerciseId(exerciseId: string): Promise<void>

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
