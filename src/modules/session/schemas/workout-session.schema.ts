import { WorkoutSessionStatus } from 'generated/prisma'
import { z } from 'zod'

import {
  exerciseSessionSchema,
  sessionExerciseItemSchema,
} from './exercise-session.schema'

export const baseSessionSchema = z.object({
  id: z.string().describe('Session ID.'),
  userId: z.string().describe('User ID.'),
  workoutId: z.string().describe('Workout ID.'),
  date: z.date().describe('Session date.'),
  status: z.enum(WorkoutSessionStatus).describe('Session status.'),
  startedAt: z.date().nullable().describe('Session start time.'),
  endedAt: z.date().nullable().describe('Session end time.'),
  duration: z.number().nullable().describe('Session duration in seconds.'),
})

export const sessionWithWorkoutSchema = baseSessionSchema.extend({
  workout: z
    .object({
      id: z.string().describe('Workout ID.'),
      name: z.string().describe('Workout name.'),
      exercises: z.array(
        z.object({
          id: z.string().describe('Workout exercise relation ID.'),
          position: z
            .number()
            .int()
            .describe(
              'Current position in the workout template; session order comes from the stored exercise sessions.'
            ),
          defaultSets: z
            .number()
            .nullable()
            .describe('Default number of sets.'),
          defaultReps: z
            .number()
            .nullable()
            .describe(
              'Default repetitions per set for REPS; seconds per set for DURATION.'
            ),
          defaultWeight: z
            .number()
            .nullable()
            .describe('Default weight in kilograms.'),
          exercise: sessionExerciseItemSchema,
        })
      ),
    })
    .describe(
      'Current workout template, which may differ from the preserved exerciseSessions snapshot.'
    ),
  exerciseSessions: z
    .array(exerciseSessionSchema)
    .describe(
      'Exercise membership, order and planned defaults are captured at creation, including while PENDING. Existing sessions remain available after workout archival.'
    ),
})
