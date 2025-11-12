// constants/roles.ts

export const ROLES = {
  CUSTOMER: "customer",
  CONFERENCE_ORGANIZER: "conferenceorganizer",
  COLLABORATOR: "collaborator",
  LOCAL_REVIEWER: "localreviewer",
  EXTERNAL_REVIEWER: "externalreviewer",
  ADMIN: "admin",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_ROUTES: Record<RoleType, string> = {
  [ROLES.CUSTOMER]: "/customer",
  [ROLES.CONFERENCE_ORGANIZER]: "/workspace/organizer",
  [ROLES.COLLABORATOR]: "/workspace/collaborator",
  [ROLES.LOCAL_REVIEWER]: "/workspace/local-reviewer",
  [ROLES.EXTERNAL_REVIEWER]: "/workspace/external-reviewer",
  [ROLES.ADMIN]: "/workspace/admin",
};

export const DEFAULT_ROUTE = "/";

export const getRoleForRedirect = (roles: string[] | null): string => {
  if (!roles || roles.length === 0) return "Guest";
  if (roles.length === 1) return roles[0];

  const customerRole = roles.find(r => r.toLowerCase() === "customer");
  return customerRole ?? roles[0];
};

export const getRouteByRole = (role?: string): string => {
  if (!role) return DEFAULT_ROUTE;
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "");
  return ROLE_ROUTES[normalizedRole as RoleType] || DEFAULT_ROUTE;
};

export const canAccessRoute = (
  userRoles: string[] | null,
  requiredRoles: string[],
): boolean => {
  if (!userRoles || userRoles.length === 0) return false;

  const normalizedUserRoles = userRoles
    .filter(r => typeof r === "string")
    .map(r => r.toLowerCase().replace(/\s+/g, ""));
  const normalizedRequiredRoles = requiredRoles.map(r => r.toLowerCase().replace(/\s+/g, ""));

  for (const role of normalizedUserRoles) {
    if (normalizedRequiredRoles.includes(role)) {
      return true;
    }
  }

  return false;

  // const normalizedUserRole = userRole.toLowerCase().replace(/\s+/g, "");
  // return requiredRoles
  //   .map((r) => r.toLowerCase().replace(/\s+/g, ""))
  //   .includes(normalizedUserRole);
};
