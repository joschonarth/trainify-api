import { randomUUID } from 'node:crypto'
import type { Exercise, Prisma, WorkoutExercise } from 'generated/prisma'

import type { ExercisesRepository } from '@/modules/exercise/repositories/exercises.repository'

import type { WorkoutExercisesRepository } from '../workout-exercises.repository'

function uniqueConstraintError(): Error & { code: 'P2002' } {
  return Object.assign(
    new Error(
      'Unique constraint failed on the fields: (`workout_id`, `exercise_id`)'
    ),
    { code: 'P2002' as const }
  )
}

function connectedId(value: unknown): string {
  if (value === null || typeof value !== 'object' || !('connect' in value)) {
    throw new Error('A connected relation is required.')
  }

  const connect = value.connect
  if (connect === null || typeof connect !== 'object' || !('id' in connect)) {
    throw new Error('A relation connected by ID is required.')
  }

  const id = connect.id
  if (typeof id !== 'string') {
    throw new Error('A relation connected by ID is required.')
  }
  return id
}

type WorkoutExerciseWithExercise = WorkoutExercise & {
  exercise: {
    id: string
    name: string
    category: Exercise['category'] | null
    type: Exercise['type'] | null
  }
}

export class InMemoryWorkoutExercisesRepository
  implements WorkoutExercisesRepository
{
  items: WorkoutExercise[] = []

  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  findById(id: string): Promise<WorkoutExercise | null> {
    const workoutExercise = this.items.find((item) => item.id === id)
    return Promise.resolve(workoutExercise ? { ...workoutExercise } : null)
  }

  async findByWorkout(
    workoutId: string
  ): Promise<WorkoutExerciseWithExercise[]> {
    const results: WorkoutExerciseWithExercise[] = []
    for (const workoutExercise of this.items) {
      if (workoutExercise.workoutId !== workoutId) {
        continue
      }

      const exercise = await this.exercisesRepository.findById(
        workoutExercise.exerciseId
      )
      if (exercise) {
        results.push({
          ...workoutExercise,
          exercise: {
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            type: exercise.type,
          },
        })
      }
    }
    return results
  }

  findByWorkoutAndExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<WorkoutExercise | null> {
    const workoutExercise = this.items.find(
      (item) => item.workoutId === workoutId && item.exerciseId === exerciseId
    )
    return Promise.resolve(workoutExercise ? { ...workoutExercise } : null)
  }

  addExerciseToWorkout(
    data: Prisma.WorkoutExerciseCreateInput
  ): Promise<WorkoutExercise> {
    const workoutId = connectedId(data.workout)
    const exerciseId = connectedId(data.exercise)
    if (
      this.items.some(
        (item) =>
          item.id === data.id ||
          (item.workoutId === workoutId && item.exerciseId === exerciseId)
      )
    ) {
      return Promise.reject(uniqueConstraintError())
    }

    const workoutExercise: WorkoutExercise = {
      id: data.id ?? randomUUID(),
      workoutId,
      exerciseId,
      defaultSets: data.defaultSets ?? null,
      defaultReps: data.defaultReps ?? null,
      defaultWeight: data.defaultWeight ?? null,
    }
    this.items.push(workoutExercise)
    return Promise.resolve({ ...workoutExercise })
  }

  updateDefaults(
    workoutExerciseId: string,
    data: {
      defaultSets: number | null
      defaultReps: number | null
      defaultWeight: number | null
    }
  ): Promise<WorkoutExercise> {
    const index = this.items.findIndex((item) => item.id === workoutExerciseId)
    const current = this.items[index]
    if (!current) {
      return Promise.reject(new Error('Record to update not found.'))
    }

    const updated = { ...current, ...data }
    this.items[index] = updated
    return Promise.resolve({ ...updated })
  }

  removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === workoutExerciseId)
    if (index === -1) {
      return Promise.reject(new Error('Record to delete not found.'))
    }
    this.items.splice(index, 1)
    return Promise.resolve()
  }
}
