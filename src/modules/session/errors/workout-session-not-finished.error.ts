export class WorkoutSessionNotFinishedError extends Error {
  constructor(message = 'Workout session must be finished before completion.') {
    super(message)
    this.name = 'WorkoutSessionNotFinishedError'
  }
}
