import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function seedUser() {
  console.log('👤 Seeding user...')

  const user = await prisma.user.upsert({
    where: { email: 'joao@example.com' },
    update: {},
    create: {
      name: 'João Teste',
      email: 'joao@example.com',
      password: '$2b$06$z1egRKOP6/a/uQh/yPewO.k0LbZbIiqYLuFlc6Z52HrRUC60dPDyS',
      birthdate: new Date('2004-04-19'),
      gender: 'male',
      height: 190,
      weight: 100,
      avatarUrl: 'https://github.com/joschonarth.png',
    },
  })

  console.log(`✅ User seeded: ${user.name}`)
  return user
}
