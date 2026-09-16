import type { Prisma, User } from 'generated/prisma'

import type { UsersRepository } from '../users.repository'

export class InMemoryUsersRepository implements UsersRepository {
  items: User[] = []

  findById(id: string) {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  create(data: Prisma.UserCreateInput) {
    const user = {
      id: 'user-1',
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: new Date(),
    }

    this.items.push(user)

    return user
  }
}
