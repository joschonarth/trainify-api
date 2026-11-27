import type { UserRole } from 'generated/prisma'
import { requireRole } from './require-role'

export type Permission = 'global-exercises:read' | 'global-exercises:write'

const permissionRoles: Record<Permission, UserRole[]> = {
  'global-exercises:read': ['ADMIN'],
  'global-exercises:write': ['ADMIN'],
}

export function requirePermission(permission: Permission) {
  return requireRole(...permissionRoles[permission])
}
