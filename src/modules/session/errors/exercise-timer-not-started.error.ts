export class ExerciseTimerNotStartedError extends Error {
  constructor(message = 'Exercise timer has not been started.') {
    super(message)
    this.name = 'ExerciseTimerNotStartedError'
  }
}
