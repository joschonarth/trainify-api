import { z } from 'zod'

import { exerciseSchema } from './exercise.schema'

export const myExerciseSchema = exerciseSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    myExerciseId: z.string().describe('User exercise relation ID.'),
    exerciseId: z.string().describe('Exercise ID.'),
    addedAt: z.date().describe('Date the exercise was added to the library.'),
  })
