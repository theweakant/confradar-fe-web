"use client"

import RouteGuard from "@/utils/routeGuard"

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={["ConferenceOrganizer"]}>
      {children}
    </RouteGuard>
  )
}
