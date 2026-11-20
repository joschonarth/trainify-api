import type {
  ExerciseTimerRepositories,
  ExerciseTimerUnitOfWork,
} from '../exercise-timer-unit-of-work'

export class InMemoryExerciseTimerUnitOfWork
  implements ExerciseTimerUnitOfWork
{
  private queue: Promise<unknown> = Promise.resolve()
  constructor(private readonly repositories: ExerciseTimerRepositories) {}
  execute<T>(
    _id: string,
    operation: (repositories: ExerciseTimerRepositories) => Promise<T>
  ): Promise<T> {
    const result = this.queue.then(() => operation(this.repositories))
    this.queue = result.catch(() => undefined)
    return result
  }
}
