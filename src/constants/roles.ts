// constants/roles.ts

export const ROLE_ROUTES: Record<string, string> = {
  customer: "/customer",
  conferenceorganizer: "/workspace/organizer",
  collaborator: "/workspace/collaborator",

  localreviewer: "/workspace/local-reviewer",
  headreviewer: "/workspace/head-reviewer",
  
  admin: "/workspace/admin",
}

export const DEFAULT_ROUTE = "/"

export const getRouteByRole = (role?: string): string => {
  if (!role) return DEFAULT_ROUTE
  return ROLE_ROUTES[role.toLowerCase()] || DEFAULT_ROUTE
}

export const canAccessRoute = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())
}
