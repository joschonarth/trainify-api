export class ExerciseTimerAlreadyRunningError extends Error {
  constructor(message = 'Exercise timer already started.') {
    super(message)
    this.name = 'ExerciseTimerAlreadyRunningError'
  }
}
