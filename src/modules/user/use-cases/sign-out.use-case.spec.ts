import { describe, expect, it } from 'vitest'

import { SignOutUseCase } from './sign-out.use-case'

describe('Sign Out Use Case', () => {
  it('should complete successfully', async () => {
    const sut = new SignOutUseCase()

    await expect(sut.execute()).resolves.toBeUndefined()
  })
})
