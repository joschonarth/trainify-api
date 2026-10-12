import { hash } from 'bcrypt'
import type { Prisma } from 'generated/prisma'

import type { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users.repository'

export function makeUserData(
  overrides: Partial<Prisma.UserCreateInput> = {}
): Prisma.UserCreateInput {
  return {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: null,
    ...overrides,
  }
}

export async function makeUser(
  repository: InMemoryUsersRepository,
  overrides: Partial<Prisma.UserCreateInput & { rawPassword: string }> = {}
) {
  const { rawPassword, ...rest } = overrides

  return await repository.create(
    makeUserData({
      ...rest,
      ...(rawPassword && { password: await hash(rawPassword, 4) }),
    })
  )
}
