import { Measurement } from 'generated/prisma'
import { z } from 'zod'

export const sessionExerciseItemSchema = z.object({
  id: z.string().describe('Exercise ID.'),
  name: z
    .string()
    .describe(
      'Current exercise name from the exercise catalog; not a session snapshot.'
    ),
  category: z.string().nullable().describe('Exercise category.'),
  type: z.string().nullable().describe('Exercise type.'),
  measurement: z
    .enum(Measurement)
    .describe('Current exercise measurement mode; not a session snapshot.'),
})

export const sessionExerciseLogSchema = z.object({
  id: z.string().describe('Log ID.'),
  sets: z.number().describe('Number of sets logged.'),
  reps: z
    .number()
    .describe(
      'Repetitions per set for REPS; positive integer seconds per set for DURATION. Reported execution comes from the payload, not the timer.'
    ),
  weight: z.number().nullable().describe('Weight logged in kilograms.'),
  date: z.date().describe('Log date.'),
  description: z.string().nullable().describe('Log notes.'),
})

export const exerciseSessionSchema = z.object({
  id: z.string().describe('Exercise session ID.'),
  plannedSets: z
    .number()
    .nullable()
    .describe(
      'Number of sets captured at session creation; later workout edits do not change it.'
    ),
  plannedReps: z
    .number()
    .nullable()
    .describe(
      'Repetitions per set for REPS or seconds per set for DURATION, captured at creation; later workout edits do not change them.'
    ),
  plannedWeight: z
    .number()
    .nullable()
    .describe(
      'Weight in kilograms captured at session creation; later workout edits do not change it.'
    ),
  completed: z
    .boolean()
    .describe('Whether the exercise session was completed.'),
  skipReason: z
    .string()
    .nullable()
    .describe('Reason the exercise was skipped.'),
  state: z
    .enum(['COMPLETED', 'SKIPPED', 'PENDING'])
    .describe('Derived state of the exercise session.'),
  startedAt: z.date().nullable().describe('Exercise session start time.'),
  endedAt: z.date().nullable().describe('Exercise session end time.'),
  duration: z
    .number()
    .nullable()
    .describe('Exercise session duration in seconds.'),
  exercise: sessionExerciseItemSchema,
  logs: z.array(sessionExerciseLogSchema),
})

export const exerciseTimerSessionSchema = z.object({
  id: z.string().describe('Exercise session ID.'),
  startedAt: z.date().nullable().describe('Exercise session start time.'),
  endedAt: z.date().nullable().describe('Exercise session end time.'),
  duration: z
    .number()
    .nullable()
    .describe('Exercise session duration in seconds.'),
  completed: z
    .boolean()
    .describe('Whether the exercise session was completed.'),
  skipReason: z
    .string()
    .nullable()
    .describe('Reason the exercise was skipped.'),
  plannedSets: z
    .number()
    .nullable()
    .describe(
      'Number of sets captured at session creation; later workout edits do not change it.'
    ),
  plannedReps: z
    .number()
    .nullable()
    .describe(
      'Repetitions per set for REPS or seconds per set for DURATION, captured at creation; later workout edits do not change them.'
    ),
  plannedWeight: z
    .number()
    .nullable()
    .describe(
      'Weight in kilograms captured at session creation; later workout edits do not change it.'
    ),
  workoutSessionId: z.string().describe('Workout session ID.'),
  exerciseId: z.string().describe('Exercise ID.'),
})

// --- Exercise Session Details ---

export const exerciseSessionDetailsSchema = z.object({
  id: z.string().describe('Exercise session ID.'),
  exerciseId: z.string().describe('Exercise ID.'),
  exerciseName: z
    .string()
    .describe(
      'Current exercise name from the exercise catalog; not a session snapshot.'
    ),
  category: z.string().nullable().describe('Exercise category.'),
  type: z.string().nullable().describe('Exercise type.'),
  plannedSets: z
    .number()
    .nullable()
    .describe(
      'Number of sets captured at session creation; later workout edits do not change it.'
    ),
  plannedReps: z
    .number()
    .nullable()
    .describe(
      'Repetitions per set for REPS or seconds per set for DURATION, captured at creation; later workout edits do not change them.'
    ),
  plannedWeight: z
    .number()
    .nullable()
    .describe(
      'Weight in kilograms captured at session creation; later workout edits do not change it.'
    ),
  completed: z
    .boolean()
    .describe('Whether the exercise session was completed.'),
  skipReason: z
    .string()
    .nullable()
    .describe('Reason the exercise was skipped.'),
  state: z.enum(['COMPLETED', 'SKIPPED', 'PENDING']),
  startedAt: z.date().nullable().describe('Exercise session start time.'),
  endedAt: z.date().nullable().describe('Exercise session end time.'),
  duration: z
    .number()
    .nullable()
    .describe('Exercise session duration in seconds.'),
  loggedSets: z.number().nullable().describe('Logged number of sets.'),
  loggedReps: z.number().nullable().describe('Logged number of reps.'),
  loggedWeight: z.number().nullable().describe('Logged weight in kilograms.'),
  description: z.string().nullable().describe('Log notes.'),
  repsComparison: z
    .object({
      plannedReps: z.number().nullable(),
      loggedReps: z.number(),
      metPlan: z.boolean().nullable(),
    })
    .nullable(),
})
