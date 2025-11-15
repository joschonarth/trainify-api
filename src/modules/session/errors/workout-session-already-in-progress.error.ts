export class WorkoutSessionAlreadyInProgressError extends Error {
  constructor(message = 'Workout session already in progress.') {
    super(message)
    this.name = 'WorkoutSessionAlreadyInProgressError'
  }
}
