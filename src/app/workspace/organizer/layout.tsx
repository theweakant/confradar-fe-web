"use client";

import { ROLES } from "@/constants/roles";
import RouteGuard from "@/utils/routeGuard";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={[ROLES.CONFERENCE_ORGANIZER]}>
      {children}
    </RouteGuard>
  );
}
