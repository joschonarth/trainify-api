export class InvalidWeightGoalError extends Error {
  constructor(
    message = 'Cannot log weight for an inactive or already achieved goal.'
  ) {
    super(message)
    this.name = 'InvalidWeightGoalError'
  }
}
