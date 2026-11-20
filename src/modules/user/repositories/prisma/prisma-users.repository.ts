import type { Prisma } from 'generated/prisma'

import { prisma } from '@/lib/prisma'

import type { UsersRepository } from '../users.repository'

export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly client: Prisma.TransactionClient = prisma) {}

  async findById(id: string) {
    const user = await this.client.user.findUnique({
      where: {
        id,
      },
    })

    return user
  }

  async findByEmail(email: string) {
    const user = await this.client.user.findUnique({
      where: {
        email,
      },
    })

    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await this.client.user.create({
      data,
    })

    return user
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return await this.client.user.update({
      where: { id },
      data,
    })
  }
}
