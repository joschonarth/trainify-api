import { randomUUID } from 'node:crypto'
import type { Prisma, User } from 'generated/prisma'

import type { UsersRepository } from '../users.repository'

function unwrap<T>(value: unknown, current: T): T {
  if (value === undefined) {
    return current
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    'set' in value
  ) {
    const set = (value as { set?: T }).set
    return set === undefined ? current : set
  }

  return value as T
}

function copyUser(user: User): User {
  return {
    ...user,
    birthdate: user.birthdate ? new Date(user.birthdate) : null,
    createdAt: new Date(user.createdAt),
  }
}

export class InMemoryUsersRepository implements UsersRepository {
  items: User[] = []

  findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id)

    return Promise.resolve(user ? copyUser(user) : null)
  }

  findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email)

    return Promise.resolve(user ? copyUser(user) : null)
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    if (this.items.some((item) => item.email === data.email)) {
      return Promise.reject(
        Object.assign(
          new Error('Unique constraint failed on the fields: (`email`)'),
          { code: 'P2002' }
        )
      )
    }

    const user: User = {
      id: data.id ?? randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password ?? null,
      avatarUrl: data.avatarUrl ?? null,
      height: data.height ?? null,
      weight: data.weight ?? null,
      gender: data.gender ?? null,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    }

    this.items.push(user)

    return Promise.resolve(copyUser(user))
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const index = this.items.findIndex((item) => item.id === id)
    const current = this.items[index]

    if (!current) {
      return Promise.reject(new Error('Record to update not found.'))
    }

    const birthdate = unwrap<Date | string | null>(
      data.birthdate,
      current.birthdate
    )
    const createdAt = unwrap<Date | string>(data.createdAt, current.createdAt)

    const updated: User = {
      ...current,
      id: unwrap(data.id, current.id),
      name: unwrap(data.name, current.name),
      email: unwrap(data.email, current.email),
      password: unwrap(data.password, current.password),
      avatarUrl: unwrap(data.avatarUrl, current.avatarUrl),
      height: unwrap(data.height, current.height),
      weight: unwrap(data.weight, current.weight),
      gender: unwrap(data.gender, current.gender),
      birthdate: birthdate ? new Date(birthdate) : null,
      createdAt: new Date(createdAt),
    }

    this.items[index] = updated

    return Promise.resolve(copyUser(updated))
  }
}
