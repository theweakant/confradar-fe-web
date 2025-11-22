// src/app/workspace/WorkspaceHeader.tsx
"use client";

import React from "react";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/redux/hooks/useAuth";
import { useProfile } from "@/redux/hooks/useProfile";
import { useRouter } from "next/navigation"; 

interface WorkspaceHeaderProps {
  unreadCount: number;
}

export default function WorkspaceHeader({ unreadCount }: WorkspaceHeaderProps) {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const router = useRouter(); 

  const roles: string[] = user?.role ?? [];
  const fullName = profile?.fullName || user?.email || "User";

  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleBellClick = () => {
    router.push("/notifications"); // 👈 Chuyển đến trang thông báo
  };

  return (
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
        {/* 🔔 Icon chuông — điều hướng khi click */}
        <button
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={handleBellClick}
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {/* 👤 Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {isLoading ? "Đang tải..." : fullName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{roles.join(", ")}</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
}