// components/RightSidebar/RegisteredUserSection.tsx
"use client";

import { Loader2, User, Clock, Mail, Ticket } from "lucide-react";
import { useViewRegisteredUsersForConferenceQuery } from "@/redux/services/conference.service";
import { formatDate } from "@/helper/format";
import Image from "next/image";

interface RegisteredUserSectionProps {
  conferenceId: string;
  conferenceName: string; 
  limit?: number;
  onOpenFullList?: () => void; 
}

export function RegisteredUserSection({
  conferenceId,
  conferenceName,
  limit = 10,
  onOpenFullList,
}: RegisteredUserSectionProps) {
  const { data, isLoading, error } = useViewRegisteredUsersForConferenceQuery(conferenceId);

  const registeredUsers = Array.isArray(data?.data) ? data.data : [];
  const recentUsers = [...registeredUsers]
    .sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime())
    .slice(0, limit);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Người tham dự</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || recentUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Người tham dự</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">
            {error ? "Không tải được dữ liệu" : "Chưa có ai đăng ký"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Người tham dự</h3>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {recentUsers.map((user) => (
          <div
            key={user.ticketId}
            className="group flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`Avatar of ${user.userName}`}
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.userName}
                </p>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {user.ticketId.slice(-6)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{formatDate(user.registeredDate) || "—"}</span>
              </div>

              <div className="mt-2">
                {user.isRefunded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Đã hoàn vé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Đã thanh toán
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút "Xem tất cả" — chỉ hiển thị nếu có callback */}
      {onOpenFullList && registeredUsers.length > limit && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onOpenFullList}
            className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1.5 rounded-md hover:bg-blue-50"
          >
            Xem tất cả ({registeredUsers.length})
          </button>
        </div>
      )}
    </div>
  );
}