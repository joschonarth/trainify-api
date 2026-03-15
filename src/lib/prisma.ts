import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma'
import { env } from '@/env'

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
})

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})
