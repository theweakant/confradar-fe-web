"use client";

import { ROLES } from "@/constants/roles";
import RouteGuard from "@/utils/routeGuard";

export default function ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={[ROLES.LOCAL_REVIEWER, ROLES.EXTERNAL_REVIEWER]}>
      {children}
    </RouteGuard>
  );
}
