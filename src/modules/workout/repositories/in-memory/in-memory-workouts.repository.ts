import { randomUUID } from 'node:crypto'
import type { Prisma, Workout } from 'generated/prisma'

import type { WorkoutExercisesRepository } from '../workout-exercises.repository'
import type {
  WorkoutsRepository,
  WorkoutWithDetails,
} from '../workouts.repository'

function uniqueConstraintError(): Error & { code: 'P2002' } {
  return Object.assign(
    new Error('Unique constraint failed on the fields: (`name`, `user_id`)'),
    { code: 'P2002' as const }
  )
}

function copyWorkout(workout: Workout): Workout {
  return { ...workout, createdAt: new Date(workout.createdAt) }
}

function connectedUserId(data: Prisma.WorkoutCreateInput): string {
  const id = data.user.connect?.id
  if (!id) {
    throw new Error('A user connected by ID is required.')
  }
  return id
}

export class InMemoryWorkoutsRepository implements WorkoutsRepository {
  items: Workout[] = []

  constructor(
    private readonly workoutExercisesRepository?: WorkoutExercisesRepository
  ) {}

  create(data: Prisma.WorkoutCreateInput): Promise<Workout> {
    const userId = connectedUserId(data)
    if (
      this.items.some(
        (item) =>
          item.id === data.id ||
          (item.userId === userId && item.name === data.name)
      )
    ) {
      return Promise.reject(uniqueConstraintError())
    }

    const workout: Workout = {
      id: data.id ?? randomUUID(),
      name: data.name,
      description: data.description ?? null,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      userId,
    }
    this.items.push(workout)
    return Promise.resolve(copyWorkout(workout))
  }

  findById(id: string): Promise<Workout | null> {
    const workout = this.items.find((item) => item.id === id)
    return Promise.resolve(workout ? copyWorkout(workout) : null)
  }

  async findByIdWithDetails(id: string): Promise<WorkoutWithDetails | null> {
    const workout = await this.findById(id)
    if (!workout) {
      return null
    }
    const exercises = this.workoutExercisesRepository
      ? await this.workoutExercisesRepository.findByWorkout(id)
      : []
    return { ...workout, exercises, schedules: [] }
  }

  async findAllByUser(userId: string) {
    const workouts = this.items
      .filter((item) => item.userId === userId)
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      )

    return await Promise.all(
      workouts.map(async (workout) => ({
        ...copyWorkout(workout),
        exercises: this.workoutExercisesRepository
          ? await this.workoutExercisesRepository.findByWorkout(workout.id)
          : [],
        schedules: [],
      }))
    )
  }

  update(
    id: string,
    data: { name?: string; description?: string | null }
  ): Promise<Workout> {
    const index = this.items.findIndex((item) => item.id === id)
    const current = this.items[index]
    if (!current) {
      return Promise.reject(new Error('Record to update not found.'))
    }
    const updated: Workout = {
      ...current,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
    }
    this.items[index] = updated
    return Promise.resolve(copyWorkout(updated))
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error('Record to delete not found.')
    }
    this.items.splice(index, 1)
    if (this.workoutExercisesRepository) {
      const workoutExercises =
        await this.workoutExercisesRepository.findByWorkout(id)
      await Promise.all(
        workoutExercises.map((item) =>
          this.workoutExercisesRepository?.removeExerciseFromWorkout(item.id)
        )
      )
    }
  }
}
