import { ResourceNotFoundError } from '@/errors/resource-not-found.error'
import { WorkoutExercisesRepository } from '@/repositories/workout-exercises.repository'
import { WorkoutsRepository } from '@/repositories/workouts.repository'

interface FetchWorkoutExercisesUseCaseRequest {
  workoutId: string
}

interface FetchWorkoutExercisesUseCaseResponse {
  exercises: {
    id: string
    exerciseId: string
    defaultSets: number | null
    defaultReps: number | null
    defaultWeight: number | null
    exercise: {
      id: string
      name: string
      category: string | null
      type: string | null
    }
  }[]
}

export class FetchWorkoutExercisesUseCase {
  constructor(
    private workoutsRepository: WorkoutsRepository,
    private workoutExercisesRepository: WorkoutExercisesRepository,
  ) {}

  async execute({
    workoutId,
  }: FetchWorkoutExercisesUseCaseRequest): Promise<FetchWorkoutExercisesUseCaseResponse> {
    const workout = await this.workoutsRepository.findById(workoutId)
    if (!workout) {
      throw new ResourceNotFoundError('Workout not found.')
    }

    const exercises =
      await this.workoutExercisesRepository.findByWorkout(workoutId)

    return { exercises }
  }
}
