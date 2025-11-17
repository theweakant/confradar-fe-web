"use client";

import { Info, Loader2, Mail, Calendar, User, Ticket } from "lucide-react";
import { useViewRegisteredUsersForConferenceQuery } from "@/redux/services/conference.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/helper/format"; 
import Image from "next/image";

interface RegisteredUserTabProps {
  conferenceId: string;
}

export function RegisteredUserTab({ conferenceId }: RegisteredUserTabProps) {
  const { data, isLoading, error } = useViewRegisteredUsersForConferenceQuery(conferenceId);

  const registeredUsers = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Đang tải danh sách người tham dự...</span>
      </div>
    );
  }

  if (error || registeredUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {error ? "Không thể tải dữ liệu" : "Chưa có khách đã đăng ký"}
        </h3>
        <p className="text-gray-500">
          {error
            ? "Đã xảy ra lỗi khi lấy danh sách người tham dự"
            : "Chưa có ai đăng ký tham dự hội nghị này"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {registeredUsers.map((user) => (
        <Card key={user.ticketId} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 flex flex-row items-start gap-4">
            <div className="relative">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.userName}
                  width={48}
                  height={48}
                  className="rounded-full border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-medium text-gray-900">
                {user.userName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-500">Mã vé:</span>
                <span className="font-mono font-medium">{user.ticketId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-500">Ngày đăng ký:</span>
                <span>{formatDate(user.registeredDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono text-xs">{user.userId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Hoàn vé:</span>
                <span className={user.isRefunded ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                  {user.isRefunded ? "Đã hoàn" : "Chưa hoàn"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}