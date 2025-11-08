"use client";

import RouteGuard from "@/utils/routeGuard";

export default function ExternalReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["ExternalReviewer"]}>{children}</RouteGuard>
  );
}
