import type { Prisma, User } from 'generated/prisma'

import type { UsersRepository } from '../users.repository'

export class InMemoryUsersRepository implements UsersRepository {
  items: User[] = []

  findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return Promise.resolve(null)
    }

    return Promise.resolve(user)
  }

  findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return Promise.resolve(null)
    }

    return Promise.resolve(user)
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: 'user-1',
      name: data.name,
      email: data.email,
      password: data.password ?? null,
      avatarUrl: data.avatarUrl ?? null,
      height: data.height ?? null,
      weight: data.weight ?? null,
      gender: data.gender ?? null,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
      createdAt: new Date(),
    }

    this.items.push(user)

    return Promise.resolve(user)
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      throw new Error('User not found.')
    }

    Object.assign(user, data)
    return Promise.resolve(user)
  }
}
