export class AnotherExerciseTimerRunningError extends Error {
  constructor(
    message = 'Another exercise timer is already running in this workout session.'
  ) {
    super(message)
    this.name = 'AnotherExerciseTimerRunningError'
  }
}
