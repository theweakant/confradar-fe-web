"use client";

import { Users, Calendar, FileText, TrendingUp, Activity } from "lucide-react";
import {
  useGetTotalUsersQuery,
  useGetInternalEventCountQuery,
  useGetExternalEventCountQuery,
  useGetRecentAuditLogsQuery,
  useGetRecentReportsQuery,
  useGetTotalUnresolveReportsQuery,
} from "@/redux/services/auditlog.service";
import type { InternalEventCount, ExternalEventCount } from "@/types/auditlog.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Không xác định";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function AdminDashboard() {
  const { data: totalUsersRes } = useGetTotalUsersQuery();
  const { data: totalUnresolveReportsRes } = useGetTotalUnresolveReportsQuery();
  const { data: internalData } = useGetInternalEventCountQuery();
  const { data: externalData } = useGetExternalEventCountQuery();
  const { data: recentAuditsRes } = useGetRecentAuditLogsQuery({ row: 5 });
  const { data: recentReportsRes } = useGetRecentReportsQuery({ row: 5 });

  const totalUsers = totalUsersRes?.data ?? 0;
  const pendingReportsCount = totalUnresolveReportsRes?.data ?? 0;

  const internal: InternalEventCount = internalData?.data || {
    totalInternal: 0,
    totalActiveInternalResearch: 0,
    totalActiveInternalTech: 0,
  };

  const external: ExternalEventCount = externalData?.data || {
    totalExternal: 0,
    totalActiveExternalResearch: 0,
    totalActiveExternalTech: 0,
  };

  const recentAudits = recentAuditsRes?.data || [];
  const recentReports = recentReportsRes?.data || [];

  const recentActivities = recentAudits.map((log) => ({
    user: log.userFullName || "Người dùng ẩn danh",
    category: log.categoryName || "Khác",
    action: log.actionDescription || "Đã thực hiện một hành động",
    time: log.createdAt ? formatDateTime(log.createdAt) : "Không xác định",
    avatarUrl: log.userAvatarUrl,
  }));

  const reportItems = recentReports.map((report) => ({
    title: report.reportSubject || "Không có tiêu đề",
    reason: report.reason || "",
    description: report.description || "",
    status: report.hasResolve ? "Đã giải quyết" : "Chưa giải quyết",
    time: report.createdAt ? formatDateTime(report.createdAt) : "Không xác định",
  }));

  const stats = [
    {
      title: "Tổng người dùng",
      value: totalUsers.toLocaleString("vi-VN"),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Báo cáo cần giải quyết",
      value: pendingReportsCount.toLocaleString("vi-VN"),
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Nội bộ ConfRadar",
      total: internal.totalInternal,
      research: internal.totalActiveInternalResearch,
      tech: internal.totalActiveInternalTech,
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Bên ngoài",
      total: external.totalExternal,
      research: external.totalActiveExternalResearch,
      tech: external.totalActiveExternalTech,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giải quyết":
        return "text-green-600 bg-green-50";
      case "Chưa giải quyết":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản Trị Hệ Thống</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value !== undefined
                      ? stat.value
                      : (stat.total ?? 0).toString()}
                  </p>
                  {stat.research !== undefined && stat.tech !== undefined && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        Nghiên cứu:{" "}
                        <span className="font-medium text-gray-800">
                          {stat.research}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Kỹ thuật:{" "}
                        <span className="font-medium text-gray-800">
                          {stat.tech}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ml-2 flex-shrink-0`}>
                  <Icon
                    className={`${stat.color.replace("bg-", "text-")}`}
                    size={24}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Hoạt động gần đây
            </h2>
            <Activity className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage
                      src={activity.avatarUrl?.trim() || undefined}
                      alt={activity.user}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-sm">
                      {activity.user.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {activity.user}
                      </p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        {activity.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mt-1">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Không có hoạt động gần đây
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Báo cáo gần đây
            </h2>
            <FileText className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {reportItems.length > 0 ? (
              reportItems.map((report, index) => (
                <div
                  key={index}
                  className="pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {report.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Lý do:</span> {report.reason}
                  </p>
                  {report.description && (
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Mô tả:</span>{" "}
                      {report.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{report.time}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Không có báo cáo gần đây
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}