import { ExerciseCategory, ExerciseType, PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function seedWorkoutExercises(userId, workouts) {
  console.log('💪 Seeding exercises...')

  const baseExercises = [
    // Treino A - Peito e Tríceps
    {
      name: 'Supino Reto',
      category: ExerciseCategory.CHEST,
      type: ExerciseType.STRENGTH,
      sets: 4,
      reps: 10,
      weight: 60,
    },
    {
      name: 'Crucifixo Inclinado',
      category: ExerciseCategory.CHEST,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 12,
      weight: 18,
    },
    {
      name: 'Tríceps Corda',
      category: ExerciseCategory.TRICEPS,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 12,
      weight: 25,
    },
    {
      name: 'Mergulho nas Paralelas',
      category: ExerciseCategory.TRICEPS,
      type: ExerciseType.BODYWEIGHT,
      sets: 3,
      reps: 10,
      weight: 0,
    },

    // Treino B - Costas e Bíceps
    {
      name: 'Puxada Frontal',
      category: ExerciseCategory.BACK,
      type: ExerciseType.STRENGTH,
      sets: 4,
      reps: 10,
      weight: 45,
    },
    {
      name: 'Remada Curvada',
      category: ExerciseCategory.BACK,
      type: ExerciseType.STRENGTH,
      sets: 4,
      reps: 10,
      weight: 40,
    },
    {
      name: 'Rosca Direta',
      category: ExerciseCategory.BICEPS,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 10,
      weight: 20,
    },
    {
      name: 'Rosca Alternada',
      category: ExerciseCategory.BICEPS,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 12,
      weight: 15,
    },

    // Treino C - Pernas e Ombros
    {
      name: 'Agachamento Livre',
      category: ExerciseCategory.LEGS,
      type: ExerciseType.STRENGTH,
      sets: 4,
      reps: 8,
      weight: 70,
    },
    {
      name: 'Leg Press',
      category: ExerciseCategory.LEGS,
      type: ExerciseType.STRENGTH,
      sets: 4,
      reps: 10,
      weight: 120,
    },
    {
      name: 'Desenvolvimento com Halteres',
      category: ExerciseCategory.SHOULDERS,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 10,
      weight: 25,
    },
    {
      name: 'Elevação Lateral',
      category: ExerciseCategory.SHOULDERS,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 12,
      weight: 10,
    },

    // Treino D - Core e Estabilização
    {
      name: 'Prancha',
      category: ExerciseCategory.CORE,
      type: ExerciseType.STABILITY,
      sets: 3,
      reps: 1,
      weight: 0,
    },
    {
      name: 'Abdominal Infra',
      category: ExerciseCategory.CORE,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 15,
      weight: 0,
    },
    {
      name: 'Extensão Lombar',
      category: ExerciseCategory.LOWER_BACK,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 12,
      weight: 10,
    },

    // Treino E - Full Body
    {
      name: 'Burpee',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.CARDIO,
      sets: 3,
      reps: 15,
      weight: 0,
    },
    {
      name: 'Kettlebell Swing',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.STRENGTH,
      sets: 3,
      reps: 12,
      weight: 20,
    },
    {
      name: 'Flexão de Braço',
      category: ExerciseCategory.CHEST,
      type: ExerciseType.BODYWEIGHT,
      sets: 3,
      reps: 15,
      weight: 0,
    },
  ]

  const createdExercises = []

  for (const ex of baseExercises) {
    const exercise = await prisma.exercise.upsert({
      where: {
        name_userId: {
          name: ex.name,
          userId,
        },
      },
      update: {},
      create: { ...ex, userId },
    })
    createdExercises.push(exercise)
  }

  const workoutExercisesMap = {
    A: [0, 1, 2, 3],
    B: [4, 5, 6, 7],
    C: [8, 9, 10, 11],
    D: [12, 13, 14],
    E: [15, 16, 17],
  }

  const dataToInsert = []

  workouts.forEach((workout, index) => {
    const key = ['A', 'B', 'C', 'D', 'E'][index]
    const exIndexes = workoutExercisesMap[key]
    if (exIndexes) {
      exIndexes.forEach((i) => {
        dataToInsert.push({
          workoutId: workout.id,
          exerciseId: createdExercises[i].id,
        })
      })
    }
  })

  for (const data of dataToInsert) {
    const exists = await prisma.workoutExercise.findFirst({
      where: {
        workoutId: data.workoutId,
        exerciseId: data.exerciseId,
      },
    })

    if (!exists) {
      await prisma.workoutExercise.create({ data })
    }
  }

  console.log(`✅ ${createdExercises.length} exercises created and linked!`)
}
