"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { getRouteByRole } from "@/constants/roles";
import { AuthUser } from "@/types/user.type";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const role = (user as AuthUser)?.role;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!loading && isAuthenticated && allowedRoles && role) {
      if (!allowedRoles.includes(role)) {
        const correctRoute = getRouteByRole(role);
        router.push(correctRoute);
      }
    }
  }, [isAuthenticated, loading, user, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && role && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
