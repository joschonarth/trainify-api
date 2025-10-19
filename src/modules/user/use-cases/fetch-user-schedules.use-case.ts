import { UsersRepository } from '@/modules/user/repositories/users.repository'
import { WorkoutsRepository } from '@/modules/workout/repositories/workouts.repository'
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found.error'

interface FetchUserSchedulesUseCaseRequest {
  userId: string
}

interface FetchUserSchedulesUseCaseResponse {
  schedules: {
    dayOfWeek: number
    workout: {
      id: string
      name: string
      exercises: {
        id: string
        name: string
        sets: number | null
        reps: number | null
        weight: number | null
      }[]
    }
  }[]
}

export class FetchUserSchedulesUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private workoutsRepository: WorkoutsRepository,
  ) {}

  async execute({
    userId,
  }: FetchUserSchedulesUseCaseRequest): Promise<FetchUserSchedulesUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const workouts = await this.workoutsRepository.findAllByUser(userId)

    const schedules = workouts.flatMap((workout) =>
      workout.schedules.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        workout: {
          id: workout.id,
          name: workout.name,
          exercises: workout.exercises.map((we) => ({
            id: we.exercise.id,
            name: we.exercise.name,
            sets: we.defaultSets,
            reps: we.defaultReps,
            weight: we.defaultWeight,
          })),
        },
      })),
    )

    return { schedules }
  }
}
