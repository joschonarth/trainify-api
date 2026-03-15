import type { WeightGoal, WeightLog } from 'generated/prisma'

/**
 * Calculates the progress of a weight goal as a percentage (0-100%).
 *
 * - 'LOSE': progress = how much weight lost relative to the target.
 * - 'GAIN': progress = how much weight gained relative to the target.
 * - 'MAINTAIN': progress = based on how close the user’s weights are to the target weight.
 *      Uses the average of provided logs and a consistency factor based on standard deviation.
 *      The `maintainTolerance` sets the acceptable ±range around the target weight.
 *
 * The returned value is always clamped between 0 and 100.
 *
 * @param goal - The WeightGoal object with startWeight, targetWeight, and goalType.
 * @param currentWeight - Current user weight (used if logs are empty or for LOSE/GAIN).
 * @param logs - Optional array of WeightLog objects (used only for MAINTAIN goals).
 * @param maintainTolerance - Acceptable range around target weight for MAINTAIN goals (default 2 kg).
 * @returns Progress towards the goal as a percentage between 0 and 100.
 */

export function calculateWeightGoalProgress(
  goal: WeightGoal,
  currentWeight: number,
  logs: WeightLog[] = [],
  maintainTolerance = 2
): number {
  const { goalType, startWeight, targetWeight } = goal
  const effectiveStartWeight = startWeight ?? currentWeight

  if (goalType === 'LOSE') {
    const progress =
      (effectiveStartWeight - currentWeight) /
      (effectiveStartWeight - targetWeight)
    return Math.min(Math.max(Number((progress * 100).toFixed(2)), 0), 100)
  }

  if (goalType === 'GAIN') {
    const progress =
      (currentWeight - effectiveStartWeight) /
      (targetWeight - effectiveStartWeight)
    return Math.min(Math.max(Number((progress * 100).toFixed(2)), 0), 100)
  }

  if (goalType === 'MAINTAIN') {
    const allWeights = logs.length ? logs.map((l) => l.weight) : [currentWeight]

    const mean = allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length

    const variance =
      allWeights.reduce((sum, w) => sum + (w - mean) ** 2, 0) /
      allWeights.length
    const stdDev = Math.sqrt(variance)

    const meanDistance = Math.abs(mean - targetWeight)

    const meanScore =
      meanDistance <= maintainTolerance
        ? 1
        : Math.max(
            1 - (meanDistance - maintainTolerance) / maintainTolerance,
            0
          )

    const consistencyScore = Math.exp(
      -(stdDev ** 2) / (2 * maintainTolerance ** 2)
    )

    const progress = meanScore * consistencyScore * 100
    return Number(progress.toFixed(2))
  }

  return 0
}
