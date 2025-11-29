"use client";

import { Users, Calendar, FileText, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Tổng người dùng",
      value: "2,543",
      change: "+12.5%",
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Báo cáo cần giải quyết",
      value: "48",
      change: "+8.2%",
      icon: FileText,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Hội nghị đang diễn ra",
      value: "7",
      change: "+15.3%",
      icon: Calendar,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Hội thảo/ hội nghị đang diễn ra",
      value: "12",
      change: "+23.1%",
      icon: TrendingUp,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  const recentActivities = [
    {
      user: "Nguyễn Văn A",
      action: "đã tạo hội nghị mới",
      time: "5 phút trước",
    },
    { user: "Trần Thị B", action: "đã nộp bài báo", time: "15 phút trước" },
    { user: "Lê Văn C", action: "đã đăng ký tham gia", time: "1 giờ trước" },
    { user: "Phạm Thị D", action: "đã đánh giá bài báo", time: "2 giờ trước" },
  ];

  const recentReports = [
    {
      title: "Báo cáo vi phạm nội dung",
      status: "Đang xử lý",
      time: "10 phút trước",
      priority: "high",
    },
    {
      title: "Báo cáo lỗi hệ thống",
      status: "Chờ duyệt",
      time: "1 giờ trước",
      priority: "medium",
    },
    {
      title: "Báo cáo đánh giá không công bằng",
      status: "Đã giải quyết",
      time: "3 giờ trước",
      priority: "low",
    },
    {
      title: "Báo cáo spam",
      status: "Đang xử lý",
      time: "5 giờ trước",
      priority: "high",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang xử lý":
        return "text-blue-600 bg-blue-50";
      case "Chờ duyệt":
        return "text-yellow-600 bg-yellow-50";
      case "Đã giải quyết":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản Trị Hệ Thống</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Hoạt động gần đây
            </h2>
            <Activity className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Báo cáo gần đây
            </h2>
            <FileText className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {report.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}
                  >
                    {report.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{report.time}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(report.priority)}`}
                  >
                    {report.priority === "high"
                      ? "Cao"
                      : report.priority === "medium"
                        ? "Trung bình"
                        : "Thấp"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
