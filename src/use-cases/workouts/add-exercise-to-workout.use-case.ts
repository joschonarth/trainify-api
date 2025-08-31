import { WorkoutExercise } from '@prisma/client'

import { WorkoutExercisesRepository } from '@/repositories/workout-exercises.repository'

interface AddExerciseToWorkoutUseCaseRequest {
  workoutId: string
  exerciseId: string
  defaultSets: number | null
  defaultReps: number | null
  defaultWeight: number | null
}

interface AddExerciseToWorkoutUseCaseResponse {
  workoutExercise: WorkoutExercise
}

export class AddExerciseToWorkoutUseCase {
  constructor(private workoutExercisesRepository: WorkoutExercisesRepository) {}

  async execute({
    workoutId,
    exerciseId,
    defaultSets,
    defaultReps,
    defaultWeight,
  }: AddExerciseToWorkoutUseCaseRequest): Promise<AddExerciseToWorkoutUseCaseResponse> {
    const workoutExercise =
      await this.workoutExercisesRepository.addExerciseToWorkout({
        workout: { connect: { id: workoutId } },
        exercise: { connect: { id: exerciseId } },
        defaultSets: defaultSets ?? null,
        defaultReps: defaultReps ?? null,
        defaultWeight: defaultWeight ?? null,
      })

    return { workoutExercise }
  }
}
