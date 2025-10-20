"use client"

import { ROLES } from "@/constants/roles"
import RouteGuard from "@/utils/routeGuard"

export default function CollaboratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={[ROLES.COLLABORATOR]}>
      {children}
    </RouteGuard>
  )
}
