import { WorkoutSessionStatus } from 'generated/prisma'
import { z } from 'zod'

export const sessionExerciseItemSchema = z.object({
  id: z.string().describe('Exercise ID.'),
  name: z.string().describe('Exercise name.'),
  category: z.string().nullable().describe('Exercise category.'),
  type: z.string().nullable().describe('Exercise type.'),
})

export const sessionExerciseLogSchema = z.object({
  id: z.string().describe('Log ID.'),
  sets: z.number().describe('Number of sets logged.'),
  reps: z.number().describe('Number of reps logged.'),
  weight: z.number().nullable().describe('Weight logged in kilograms.'),
  date: z.date().describe('Log date.'),
  description: z.string().nullable().describe('Log notes.'),
})

export const exerciseSessionSchema = z.object({
  id: z.string().describe('Exercise session ID.'),
  sets: z.number().describe('Number of sets.'),
  reps: z.number().describe('Number of reps.'),
  weight: z.number().nullable().describe('Weight used in kilograms.'),
  completed: z
    .boolean()
    .describe('Whether the exercise session was completed.'),
  startedAt: z.date().nullable().describe('Exercise session start time.'),
  endedAt: z.date().nullable().describe('Exercise session end time.'),
  duration: z
    .number()
    .nullable()
    .describe('Exercise session duration in seconds.'),
  exercise: sessionExerciseItemSchema,
  logs: z.array(sessionExerciseLogSchema),
})

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
  workout: z.object({
    id: z.string().describe('Workout ID.'),
    name: z.string().describe('Workout name.'),
    exercises: z.array(
      z.object({
        id: z.string().describe('Workout exercise relation ID.'),
        defaultSets: z.number().nullable().describe('Default number of sets.'),
        defaultReps: z.number().nullable().describe('Default number of reps.'),
        defaultWeight: z
          .number()
          .nullable()
          .describe('Default weight in kilograms.'),
        exercise: sessionExerciseItemSchema,
      })
    ),
  }),
  exerciseSessions: z.array(exerciseSessionSchema),
})

export const calendarDaySchema = z.object({
  date: z.string().describe('Date in YYYY-MM-DD format.'),
  completed: z
    .boolean()
    .describe('Whether a workout was completed on this day.'),
})
