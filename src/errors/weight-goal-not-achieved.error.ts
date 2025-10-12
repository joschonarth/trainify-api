export class WeightGoalNotAchievedError extends Error {
  constructor(message = 'Weight goal not yet achieved.') {
    super(message)
    this.name = 'WeightGoalNotAchievedError'
  }
}
