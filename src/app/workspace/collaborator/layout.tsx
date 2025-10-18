"use client"

import RouteGuard from "@/utils/routeGuard"

export default function CollaboratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["Collaborator"]}>
      {children}
    </RouteGuard>
  )
}
