"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; 
import RouteGuard from "@/utils/routeGuard";
import WorkspaceSidebar from "./WorkspaceSidebar";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/redux/hooks/useAuth";
import { useProfile } from "@/redux/hooks/useProfile";
import { useGetOwnNotificationsQuery } from "@/redux/services/user.service"; 

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const router = useRouter();
  
  const { data: notificationsData,refetch } = useGetOwnNotificationsQuery();

  useEffect(() => {
    if (user?.userId) {
      refetch();
    }
  }, [user?.userId, refetch]);

  const roles: string[] = user?.role ?? [];
  const fullName = profile?.fullName || user?.email || "User";

  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const unreadCount = notificationsData?.data?.filter((n) => !n.readStatus).length || 0;

  const handleBellClick = () => {
    router.push("/notifications");
  };

  return (
    <RouteGuard
      allowedRoles={[
        "Admin",
        "ConferenceOrganizer",
        "Collaborator",
        "LocalReviewer",
        "ExternalReviewer",
        "HeadReviewer",
      ]}
    >
      <div className="flex h-screen bg-gray-50">
        <WorkspaceSidebar role={roles} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative p-1 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleBellClick}
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {isLoading ? "Đang tải..." : fullName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {roles.join(", ")}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {initials}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}