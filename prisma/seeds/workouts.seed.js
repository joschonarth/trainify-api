import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function seedWorkouts(userId) {
  console.log('🏋️ Seeding workouts...')

  const workouts = [
    {
      name: 'Treino A - Peito e Tríceps',
      description:
        'Foco em força e volume para o peitoral e tríceps. Inclui exercícios compostos e isolados.',
      userId,
    },
    {
      name: 'Treino B - Costas e Bíceps',
      description:
        'Ênfase em dorsais, romboides e bíceps, com exercícios de puxada e remada.',
      userId,
    },
    {
      name: 'Treino C - Pernas e Ombros',
      description:
        'Foco em quadríceps, posteriores, glúteos e deltoides. Combina força e estabilidade.',
      userId,
    },
    {
      name: 'Treino D - Core e Estabilização',
      description:
        'Exercícios voltados para abdômen, lombar e fortalecimento do core.',
      userId,
    },
    {
      name: 'Treino E - Full Body',
      description:
        'Treino de corpo inteiro com intensidade moderada para manutenção e resistência.',
      userId,
    },
  ]

  const createdWorkouts = []

  for (const workout of workouts) {
    const existing = await prisma.workout.findFirst({
      where: { name: workout.name, userId },
    })

    if (!existing) {
      const w = await prisma.workout.create({ data: workout })
      createdWorkouts.push(w)
    } else {
      createdWorkouts.push(existing)
    }
  }

  console.log(`✅ ${createdWorkouts.length} workouts seeded!`)
  return createdWorkouts
}
