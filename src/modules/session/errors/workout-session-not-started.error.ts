export class WorkoutSessionNotStartedError extends Error {
  constructor(message = 'Workout session has not started.') {
    super(message)
    this.name = 'WorkoutSessionNotStartedError'
  }
}
