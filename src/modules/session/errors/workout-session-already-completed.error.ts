export class WorkoutSessionAlreadyCompletedError extends Error {
  constructor(message = 'Workout session already completed.') {
    super(message)
    this.name = 'WorkoutSessionAlreadyCompletedError'
  }
}
