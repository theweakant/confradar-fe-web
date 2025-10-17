import { ROLE_ROUTES, DEFAULT_ROUTE } from '@/constants/roles'

// Get route based on user role
export const getRouteByRole = (role?: string): string => {
  if (!role) return DEFAULT_ROUTE
  return ROLE_ROUTES[role.toLowerCase()] || DEFAULT_ROUTE
}

// Check if user can access route
export const canAccessRoute = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole.toLowerCase())
}