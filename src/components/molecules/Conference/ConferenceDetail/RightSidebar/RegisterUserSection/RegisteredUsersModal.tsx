// components/molecules/Status/RegisteredUsersModal.tsx
"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/helper/format";

interface RegisteredUser {
  ticketId: string;
  userName: string;
  email: string;
  avatarUrl: string | null;
  registeredDate: string;
  isRefunded: boolean;
}

interface RegisteredUsersModalProps {
  open: boolean;
  onClose: () => void;
  users: RegisteredUser[];
  conferenceName: string;
}

export function RegisteredUsersModal({
  open,
  onClose,
  users,
  conferenceName,
}: RegisteredUsersModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            Người tham dự: {conferenceName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có ai đăng ký.</p>
          ) : (
            <div className="space-y-4">
              {users
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.registeredDate).getTime() -
                    new Date(a.registeredDate).getTime()
                )
                .map((user) => (
                  <div
                    key={user.ticketId}
                    className="flex gap-3 p-3 rounded-lg border border-gray-100"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.userName}
                          width={40}
                          height={40}
                          className="rounded-full border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {user.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-nowrap">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.userName}
                          </p>
                        <span className="text-xs text-gray-500 font-mono shrink-0">
                          {user.ticketId.slice(0, 6)}
                        </span>
                        </div>

                        {/* Trạng thái — nằm sát bên phải */}
                        {user.isRefunded ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 whitespace-nowrap shrink-0">
                            Đã hoàn tiền
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 whitespace-nowrap shrink-0">
                            Đã thanh toán
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Đăng ký: {formatDate(user.registeredDate)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0" onClick={onClose}></div>
    </div>
  );
}