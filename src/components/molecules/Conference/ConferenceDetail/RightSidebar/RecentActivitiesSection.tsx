// components/RightSidebar/RecentActivitiesSection.tsx
"use client";

import { Loader2, User, Clock } from "lucide-react";
import { useViewRegisteredUsersForConferenceQuery } from "@/redux/services/conference.service";
import { formatDate } from "@/helper/format";
import Image from "next/image";

interface RecentActivitiesSectionProps {
  conferenceId: string;
  limit?: number;
}

export function RecentActivitiesSection({ 
  conferenceId, 
  limit = 10 
}: RecentActivitiesSectionProps) {
  const { data, isLoading, error } = useViewRegisteredUsersForConferenceQuery(conferenceId);

  const registeredUsers = data?.data || [];
  const recentUsers = registeredUsers
    .sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime())
    .slice(0, limit);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || recentUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">Chưa có hoạt động nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Hoạt động gần đây</h3>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {recentUsers.map((user, index) => (
          <div 
            key={user.ticketId} 
            className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.userName}
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border border-blue-200">
                  <span className="text-xs font-bold text-white">
                    {user.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.userName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                đã đăng ký tham dự
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(user.registeredDate)}
              </p>
              
              {/* Status Badge */}
              <div className="mt-1.5">
                {user.isRefunded ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    Đã hoàn vé
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    Đã thanh toán
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {registeredUsers.length > limit && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Xem tất cả {registeredUsers.length} người tham dự →
          </button>
        </div>
      )}
    </div>
  );
}