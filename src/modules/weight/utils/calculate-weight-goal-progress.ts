import type { WeightGoal, WeightLog } from 'generated/prisma'

/**
 * Calculates goal progress as a finite percentage between 0 and 100.
 * MAINTAIN progress uses the average and consistency of its weight log history.
 */
export function calculateWeightGoalProgress(
  goal: WeightGoal,
  currentWeight: number,
  logs: WeightLog[] = [],
  maintainTolerance = 2
): number {
  if (
    !(isPositiveFinite(currentWeight) && isPositiveFinite(goal.targetWeight))
  ) {
    return 0
  }

  if (goal.goalType === 'LOSE' || goal.goalType === 'GAIN') {
    return calculateDirectionalProgress(goal, currentWeight)
  }

  if (goal.goalType === 'MAINTAIN') {
    return calculateMaintainProgress(
      goal.targetWeight,
      currentWeight,
      logs,
      maintainTolerance
    )
  }

  return 0
}

function calculateDirectionalProgress(
  goal: WeightGoal,
  currentWeight: number
): number {
  const startWeight = goal.startWeight ?? currentWeight
  if (!isPositiveFinite(startWeight)) {
    return 0
  }

  if (startWeight === goal.targetWeight) {
    const targetReached =
      goal.goalType === 'LOSE'
        ? currentWeight <= goal.targetWeight
        : currentWeight >= goal.targetWeight
    return targetReached ? 100 : 0
  }

  const numerator =
    goal.goalType === 'LOSE'
      ? startWeight - currentWeight
      : currentWeight - startWeight
  const denominator =
    goal.goalType === 'LOSE'
      ? startWeight - goal.targetWeight
      : goal.targetWeight - startWeight

  return clampProgress((numerator / denominator) * 100)
}

function calculateMaintainProgress(
  targetWeight: number,
  currentWeight: number,
  logs: WeightLog[],
  maintainTolerance: number
): number {
  if (!isPositiveFinite(maintainTolerance)) {
    return 0
  }

  const logWeights = logs.map((log) => log.weight).filter(isPositiveFinite)
  const allWeights = logWeights.length ? logWeights : [currentWeight]
  const mean =
    allWeights.reduce((sum, weight) => sum + weight, 0) / allWeights.length

  if (!Number.isFinite(mean)) {
    return 0
  }

  const variance =
    allWeights.reduce((sum, weight) => sum + (weight - mean) ** 2, 0) /
    allWeights.length
  const standardDeviation = Math.sqrt(variance)
  const meanDistance = Math.abs(mean - targetWeight)
  const meanScore =
    meanDistance <= maintainTolerance
      ? 1
      : Math.max(1 - (meanDistance - maintainTolerance) / maintainTolerance, 0)
  const consistencyScore = Math.exp(
    -(standardDeviation ** 2) / (2 * maintainTolerance ** 2)
  )

  return clampProgress(meanScore * consistencyScore * 100)
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0
  }

  return Math.min(Math.max(Number(progress.toFixed(2)), 0), 100)
}
