import { ExerciseCategory, ExerciseType, PrismaClient } from 'generated/prisma'

export const prisma = new PrismaClient()

export async function seedWorkoutExercises(userId, workouts) {
  console.log('💪 Seeding exercises...')

  const baseExercises = [
    // Treino A - Peito e Tríceps
    {
      name: 'Supino Reto',
      category: ExerciseCategory.CHEST,
      type: ExerciseType.STRENGTH,
      defaultSets: 4,
      defaultReps: 10,
      defaultWeight: 60,
    },
    {
      name: 'Crucifixo Inclinado',
      category: ExerciseCategory.CHEST,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 12,
      defaultWeight: 18,
    },
    {
      name: 'Tríceps Corda',
      category: ExerciseCategory.TRICEPS,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 12,
      defaultWeight: 25,
    },
    {
      name: 'Mergulho nas Paralelas',
      category: ExerciseCategory.TRICEPS,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 0,
    },

    // Treino B - Costas e Bíceps
    {
      name: 'Puxada Frontal',
      category: ExerciseCategory.BACK,
      type: ExerciseType.STRENGTH,
      defaultSets: 4,
      defaultReps: 10,
      defaultWeight: 45,
    },
    {
      name: 'Remada Curvada',
      category: ExerciseCategory.BACK,
      type: ExerciseType.STRENGTH,
      defaultSets: 4,
      defaultReps: 10,
      defaultWeight: 40,
    },
    {
      name: 'Rosca Direta',
      category: ExerciseCategory.BICEPS,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 20,
    },
    {
      name: 'Rosca Alternada',
      category: ExerciseCategory.BICEPS,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 12,
      defaultWeight: 15,
    },

    // Treino C - Pernas e Ombros
    {
      name: 'Agachamento Livre',
      category: ExerciseCategory.LEGS,
      type: ExerciseType.STRENGTH,
      defaultSets: 4,
      defaultReps: 8,
      defaultWeight: 70,
    },
    {
      name: 'Leg Press',
      category: ExerciseCategory.LEGS,
      type: ExerciseType.STRENGTH,
      defaultSets: 4,
      defaultReps: 10,
      defaultWeight: 120,
    },
    {
      name: 'Desenvolvimento com Halteres',
      category: ExerciseCategory.SHOULDERS,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 25,
    },
    {
      name: 'Elevação Lateral',
      category: ExerciseCategory.SHOULDERS,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 12,
      defaultWeight: 10,
    },

    // Treino D - Abdômen e Estabilização
    {
      name: 'Prancha',
      category: ExerciseCategory.ABS,
      type: ExerciseType.MOBILITY,
      defaultSets: 3,
      defaultReps: 1,
      defaultWeight: 0,
    },
    {
      name: 'Abdominal Infra',
      category: ExerciseCategory.ABS,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 15,
      defaultWeight: 0,
    },
    {
      name: 'Extensão Lombar',
      category: ExerciseCategory.BACK,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 12,
      defaultWeight: 10,
    },

    // Treino E - Full Body
    {
      name: 'Burpee',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.CARDIO,
      defaultSets: 3,
      defaultReps: 15,
      defaultWeight: 0,
    },
    {
      name: 'Kettlebell Swing',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 12,
      defaultWeight: 20,
    },
    {
      name: 'Flexão de Braço',
      category: ExerciseCategory.CHEST,
      type: ExerciseType.STRENGTH,
      defaultSets: 3,
      defaultReps: 15,
      defaultWeight: 0,
    },

    // Treino F - Mobilidade
    {
      name: 'Alongamento de Isquiotibiais',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.FLEXIBILITY,
      defaultSets: 3,
      defaultReps: 20,
      defaultWeight: 0,
    },
    {
      name: 'Mobilidade de Quadril',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.FLEXIBILITY,
      defaultSets: 3,
      defaultReps: 15,
      defaultWeight: 0,
    },
    {
      name: 'Alongamento de Ombros',
      category: ExerciseCategory.SHOULDERS,
      type: ExerciseType.FLEXIBILITY,
      defaultSets: 3,
      defaultReps: 20,
      defaultWeight: 0,
    },

    // Treino G - HIIT
    {
      name: 'Corrida no Lugar',
      category: ExerciseCategory.LEGS,
      type: ExerciseType.CARDIO,
      defaultSets: 3,
      defaultReps: 60,
      defaultWeight: 0,
    },
    {
      name: 'Mountain Climbers',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.CARDIO,
      defaultSets: 3,
      defaultReps: 30,
      defaultWeight: 0,
    },
    {
      name: 'Polichinelo',
      category: ExerciseCategory.FULL_BODY,
      type: ExerciseType.CARDIO,
      defaultSets: 3,
      defaultReps: 25,
      defaultWeight: 0,
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
      create: {
        name: ex.name,
        category: ex.category,
        type: ex.type,
        userId,
      },
    })

    createdExercises.push({ ...exercise, ...ex })
  }

  const workoutExercisesMap = {
    A: [0, 1, 2, 3],
    B: [4, 5, 6, 7],
    C: [8, 9, 10, 11],
    D: [12, 13, 14],
    E: [15, 16, 17],
    F: [18, 19, 20],
    G: [21, 22, 23],
  }

  const dataToInsert = []

  workouts.forEach((workout, index) => {
    const key = ['A', 'B', 'C', 'D', 'E', 'F', 'G'][index]
    const exIndexes = workoutExercisesMap[key]

    if (exIndexes) {
      exIndexes.forEach((i) => {
        const ex = createdExercises[i]

        dataToInsert.push({
          workoutId: workout.id,
          exerciseId: ex.id,
          defaultSets: ex.defaultSets,
          defaultReps: ex.defaultReps,
          defaultWeight: ex.defaultWeight,
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
