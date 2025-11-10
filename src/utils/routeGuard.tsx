// utils/routeGuard.ts
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { canAccessRoute } from "@/constants/roles";

interface RouteGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RouteGuard({
  allowedRoles,
  children,
}: RouteGuardProps) {
  const router = useRouter();
  const { accessToken, role } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }

    if (role && !canAccessRoute(role, allowedRoles)) {
      router.push("/403");
    }
  }, [accessToken, role, router, allowedRoles]);

  return <>{children}</>;
}
