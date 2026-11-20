import { z } from 'zod'

export const periodSummarySchema = z.object({
  start: z.string().describe('Start date of the period.'),
  end: z.string().describe('End date of the period.'),
  totalWorkouts: z.number().describe('Total workouts completed in the period.'),
  totalSets: z.number().describe('Total sets performed in the period.'),
  totalReps: z.number().describe('Total reps performed in the period.'),
  totalWeight: z.number().describe('Total weight used in the period.'),
  totalVolume: z
    .number()
    .describe(
      'Total load volume for REPS exercises only; DURATION contributes zero, including legacy logs.'
    ),
})

export const periodDifferencesSchema = z.object({
  setsDiff: z.number().describe('Difference in total sets between periods.'),
  repsDiff: z.number().describe('Difference in total reps between periods.'),
  weightDiff: z
    .number()
    .describe('Difference in total weight between periods.'),
  volumeDiff: z
    .number()
    .describe('Difference in total volume between periods.'),
  percentageVolumeChange: z
    .number()
    .describe('Percentage change in volume between periods.'),
})
