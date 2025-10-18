"use client"

import RouteGuard from "@/utils/routeGuard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["Admin"]}>
      {children}
    </RouteGuard>
  )
}
