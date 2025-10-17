import { WeightGoal } from '@prisma/client'

/**
 * Calculates the progress of a weight goal as a percentage (0-100%).
 *
 * The calculation depends on the type of goal:
 * - 'LOSE': progress is based on how much weight has been lost relative to the target.
 * - 'GAIN': progress is based on how much weight has been gained relative to the target.
 * - 'MAINTAIN': progress is based on how close the current weight is to the target weight.
 *
 * The returned value is always clamped between 0 and 100.
 *
 * @param goal - The WeightGoal object containing startWeight, targetWeight, and goalType.
 * @param currentWeight - The user's current weight.
 * @returns The progress towards the goal as a percentage between 0 and 100.
 */
export function calculateWeightGoalProgress(
  goal: WeightGoal,
  currentWeight: number,
): number {
  const { goalType, startWeight, targetWeight } = goal
  let progress = 0

  if (goalType === 'LOSE') {
    progress = (startWeight - currentWeight) / (startWeight - targetWeight)
  } else if (goalType === 'GAIN') {
    progress = (currentWeight - startWeight) / (targetWeight - startWeight)
  } else {
    progress = 1 - Math.abs(currentWeight - targetWeight) / targetWeight
  }

  return Math.min(Math.max(progress * 100, 0), 100)
}
