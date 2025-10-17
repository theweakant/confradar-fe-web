export const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  COLLABORATOR: 'collaborator',
  REVIEWER: 'reviewer',
  GUEST: 'guest',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]


export const ROLE_ROUTES: Record<string, string> = {
  admin: '/workspace/admin',
  organizer: '/workspace/organizer',
  collaborator: '/workspace/collaborator',
  reviewer: '/workspace/reviewer',
  guest: '/workspace/guest',
}


export const DEFAULT_ROUTE = '/'