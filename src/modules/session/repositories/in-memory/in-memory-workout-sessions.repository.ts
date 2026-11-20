import type { WorkoutSession } from 'generated/prisma'
import type { ExerciseTimerRepositories } from '../exercise-timer-unit-of-work'

export class InMemoryWorkoutSessionsRepository
  implements Pick<ExerciseTimerRepositories['workoutSessions'], 'findById'>
{
  items: WorkoutSession[] = []
  findById(id: string) {
    return Promise.resolve(this.items.find((item) => item.id === id) ?? null)
  }
}
