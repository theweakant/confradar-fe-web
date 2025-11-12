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
  const { accessToken, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }

    if (!user || !canAccessRoute(user.role ?? null, allowedRoles)) {
      router.push("/403");
    }
  }, [accessToken, user, router, allowedRoles]);

  return <>{children}</>;
}
