"use client"

import { ROLES } from "@/constants/roles"
import RouteGuard from "@/utils/routeGuard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={[ROLES.ADMIN]}>
      {children}
    </RouteGuard>
  )
}
