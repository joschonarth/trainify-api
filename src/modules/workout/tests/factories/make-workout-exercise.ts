import type { Prisma, WorkoutExercise } from 'generated/prisma'

import type { InMemoryWorkoutExercisesRepository } from '../../repositories/in-memory/in-memory-workout-exercises.repository'

export async function makeWorkoutExercise(
  repository: InMemoryWorkoutExercisesRepository,
  workoutId = 'workout-id',
  exerciseId = 'exercise-id',
  overrides: Partial<Prisma.WorkoutExerciseCreateInput> = {}
): Promise<WorkoutExercise> {
  return await repository.addExerciseToWorkout({
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: null,
    workout: { connect: { id: workoutId } },
    exercise: { connect: { id: exerciseId } },
    ...overrides,
  })
}
