import type { ExerciseSession, Prisma } from 'generated/prisma'
import type { ExerciseSessionWithLogs } from '../exercise-sessions.repository'
import type { ExerciseTimerRepositories } from '../exercise-timer-unit-of-work'
import type { WorkoutSessionsRepository } from '../workout-sessions.repository'

export class InMemoryExerciseSessionsRepository
  implements
    Pick<
      ExerciseTimerRepositories['exerciseSessions'],
      'findById' | 'findByWorkoutSessionId' | 'update'
    >
{
  constructor(
    private readonly workoutSessions?: Pick<
      WorkoutSessionsRepository,
      'findById'
    >
  ) {}

  async countCompletedByUser(userId: string): Promise<number> {
    const completed = await Promise.all(
      this.items
        .filter((item) => item.completed)
        .map(async (item) => {
          const workout = await this.workoutSessions?.findById(
            item.workoutSessionId
          )
          return workout?.userId === userId
        })
    )
    return completed.filter(Boolean).length
  }

  items: ExerciseSession[] = []
  details = new Map<string, ExerciseSessionWithLogs>()
  writes = 0
  async findByIdWithLogs(id: string) {
    const item = await this.findById(id)
    if (!item) {
      return null
    }
    const detail = this.details.get(id)
    return {
      ...item,
      exercise: detail?.exercise ?? {
        id: item.exerciseId,
        name: 'Exercise',
        category: null,
        type: null,
        measurement: 'REPS' as const,
      },
      logs: [...(detail?.logs ?? [])].sort(
        (a, b) =>
          a.date.getTime() - b.date.getTime() || a.id.localeCompare(b.id)
      ),
    }
  }
  findById(id: string) {
    return Promise.resolve(this.items.find((item) => item.id === id) ?? null)
  }
  findByWorkoutSessionId(id: string) {
    return Promise.resolve(
      this.items
        .filter((item) => item.workoutSessionId === id)
        .map((item) => ({
          ...item,
          exercise: {
            id: item.exerciseId,
            name: 'Exercise',
            category: null,
            type: null,
            measurement: 'REPS' as const,
          },
          logs: [],
        }))
    )
  }
  async update(id: string, data: Prisma.ExerciseSessionUncheckedUpdateInput) {
    const item = await this.findById(id)
    if (!item) {
      throw new Error('Missing fixture')
    }
    for (const key of ['startedAt', 'endedAt', 'duration'] as const) {
      const value = data[key]
      if (
        value === null ||
        value instanceof Date ||
        typeof value === 'number'
      ) {
        Object.assign(item, { [key]: value })
      }
    }
    if (typeof data.completed === 'boolean') {
      item.completed = data.completed
    }
    this.writes += 1
    return item
  }
}
