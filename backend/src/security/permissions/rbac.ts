// Simple role->permissions map (Phase 2)
export type Permission = 'project.read' | 'project.write' | 'user.manage' | 'admin'

const rolePermissions: Record<string, Permission[]> = {
  user: ['project.read','project.write'],
  admin: ['project.read','project.write','user.manage','admin']
}

export function hasPermission(role: string, perm: Permission) {
  const perms = rolePermissions[role] || []
  return perms.includes(perm) || perms.includes('admin')
}

export function listPermissions(role: string) { return rolePermissions[role] ? [...rolePermissions[role]] : [] }
