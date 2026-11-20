import type { Prisma } from 'generated/prisma'

export const exerciseSessionWithLogsInclude = {
  exercise: {
    select: {
      id: true,
      name: true,
      category: true,
      type: true,
      measurement: true,
    },
  },
  logs: {
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      sets: true,
      reps: true,
      weight: true,
      volume: true,
      date: true,
      description: true,
    },
  },
} satisfies Prisma.ExerciseSessionInclude
