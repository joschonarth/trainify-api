import type {
  Exercise,
  ExerciseCategory,
  ExerciseType,
  WorkoutExercise,
} from 'generated/prisma'

import type { ExercisesRepository } from '@/modules/exercise/repositories/exercises.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

import type { WorkoutExercisesRepository } from '../repositories/workout-exercises.repository'
import type { WorkoutsRepository } from '../repositories/workouts.repository'

interface CreateOrAttachExerciseToWorkoutUseCaseRequest {
  userId: string
  workoutId: string
  name: string
  category: ExerciseCategory | null
  type: ExerciseType | null
  defaultSets: number | null
  defaultReps: number | null
  defaultWeight: number | null
}

interface CreateOrAttachExerciseToWorkoutUseCaseResponse {
  exercise: Exercise
  workoutExercise: WorkoutExercise
}

export class CreateOrAttachExerciseToWorkoutUseCase {
  constructor(
    private readonly exercisesRepository: ExercisesRepository,
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly workoutExercisesRepository: WorkoutExercisesRepository
  ) {}

  async execute({
    userId,
    workoutId,
    name,
    category,
    type,
    defaultSets,
    defaultReps,
    defaultWeight,
  }: CreateOrAttachExerciseToWorkoutUseCaseRequest): Promise<CreateOrAttachExerciseToWorkoutUseCaseResponse> {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout || workout.userId !== userId) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    let exercise = await this.exercisesRepository.findByNameAndUser(
      name,
      userId
    )

    if (!exercise) {
      exercise = await this.exercisesRepository.create({
        name,
        category,
        type,
        isCustom: true,
        user: { connect: { id: userId } },
      })
    }

    const workoutExercise =
      await this.workoutExercisesRepository.addExerciseToWorkout({
        workout: { connect: { id: workoutId } },
        exercise: { connect: { id: exercise.id } },
        defaultSets,
        defaultReps,
        defaultWeight,
      })

    return { exercise, workoutExercise }
  }
}
