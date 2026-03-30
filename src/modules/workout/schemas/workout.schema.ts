import { ExerciseCategory, ExerciseType } from 'generated/prisma'
import { z } from 'zod'

export const workoutSchema = z.object({
  id: z.string().describe('Workout ID.'),
  name: z.string().describe('Workout name.'),
  description: z.string().nullable().describe('Workout description.'),
  createdAt: z.date().describe('Workout creation date.'),
  userId: z.string().describe('ID of the user who owns the workout.'),
  exercises: z.array(
    z.object({
      id: z.string().describe('Workout exercise relation ID.'),
      exerciseId: z.string().describe('Exercise ID.'),
      workoutId: z.string().describe('Workout ID.'),
      defaultSets: z.number().nullable().describe('Default number of sets.'),
      defaultReps: z.number().nullable().describe('Default number of reps.'),
      defaultWeight: z
        .number()
        .nullable()
        .describe('Default weight in kilograms.'),
      exercise: z.object({
        id: z.string().describe('Exercise ID.'),
        name: z.string().describe('Exercise name.'),
        category: z
          .enum(ExerciseCategory)
          .nullable()
          .describe('Exercise category.'),
        type: z.enum(ExerciseType).nullable().describe('Exercise type.'),
      }),
    })
  ),
  schedules: z.array(
    z.object({
      id: z.string().describe('Schedule ID.'),
      userId: z.string().describe('User ID.'),
      workoutId: z.string().describe('Workout ID.'),
      dayOfWeek: z
        .number()
        .describe('Day of the week (0 = Sunday, 6 = Saturday).'),
    })
  ),
})
