import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const exercises = [
    {
      name: 'Supino Reto',
      category: 'Peito',
      type: 'Força',
      sets: 3,
      reps: 10,
      weight: 40,
    },
    {
      name: 'Agachamento',
      category: 'Pernas',
      type: 'Força',
      sets: 4,
      reps: 12,
      weight: 50,
    },
    {
      name: 'Flexão de Braço',
      category: 'Peito',
      type: 'Força',
      sets: 3,
      reps: 15,
      weight: 0,
    },
    {
      name: 'Remada Curvada',
      category: 'Costas',
      type: 'Força',
      sets: 3,
      reps: 10,
      weight: 30,
    },
    {
      name: 'Barra Fixa',
      category: 'Costas',
      type: 'Força',
      sets: 3,
      reps: 8,
      weight: 0,
    },
    {
      name: 'Leg Press',
      category: 'Pernas',
      type: 'Força',
      sets: 4,
      reps: 12,
      weight: 60,
    },
    {
      name: 'Elevação Lateral de Ombro',
      category: 'Ombro',
      type: 'Força',
      sets: 3,
      reps: 12,
      weight: 10,
    },
    {
      name: 'Rosca Direta',
      category: 'Bíceps',
      type: 'Força',
      sets: 3,
      reps: 12,
      weight: 15,
    },
    {
      name: 'Tríceps Corda',
      category: 'Tríceps',
      type: 'Força',
      sets: 3,
      reps: 12,
      weight: 20,
    },
  ]

  for (const ex of exercises) {
    const exists = await prisma.exercise.findFirst({
      where: {
        name: ex.name,
        userId: null,
      },
    })

    if (!exists) {
      await prisma.exercise.create({
        data: {
          ...ex,
          isCustom: false,
          userId: null,
        },
      })
    }
  }

  console.log('Seed completed ✅')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
