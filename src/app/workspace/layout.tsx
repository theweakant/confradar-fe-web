"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Shield,
  Building2,
  GraduationCap,
  UserCircle,
  Home
} from "lucide-react";
import { useState } from "react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Xác định role từ pathname
  let role = pathname.split("/")[2] || "guest";
  if (role === "user") role = "guest"; // gộp user thành guest
  
  // Cấu hình menu theo từng role
  const getMenuItems = () => {
    const commonItems = [
      { href: `/workspace/${role}`, icon: Home, label: "Trang chủ" },
      { href: `/workspace/${role}/profile`, icon: UserCircle, label: "Hồ sơ" },
      { href: `/workspace/${role}/settings`, icon: Settings, label: "Cài đặt" },
    ];

    const roleSpecificItems: Record<string, any[]> = {
      admin: [
        { href: `/workspace/admin`, icon: Shield, label: "Tổng quan" },
        { href: `/workspace/admin/manage-user`, icon: Users, label: "Quản lý người dùng" },
        { href: `/workspace/admin/manage-conference`, icon: Calendar, label: "Quản lý hội nghị" },
        { href: `/workspace/admin/report`, icon: FileText, label: "Báo cáo" },
        { href: `/workspace/admin/system-setting`, icon: Settings, label: "Cài đặt hệ thống" },
      ],
      organizer: [
        { href: `/workspace/organizer`, icon: LayoutDashboard, label: "Tổng quan" },
        { href: `/workspace/organizer/conferences`, icon: Calendar, label: "Hội nghị của tôi" },
        { href: `/workspace/organizer/submissions`, icon: FileText, label: "Bài nộp" },
        { href: `/workspace/organizer/participants`, icon: Users, label: "Người tham gia" },
        { href: `/workspace/organizer/settings`, icon: Settings, label: "Cài đặt" },
      ],
      reviewer: [
        { href: `/workspace/reviewer`, icon: LayoutDashboard, label: "Tổng quan" },
        { href: `/workspace/reviewer/manage-paper`, icon: FileText, label: "Bài cần đánh giá" },
        // { href: `/workspace/reviewer/manage-paper/assigned-papper-list`, icon: FileText, label: "Bài cần đánh giá" },
        { href: `/workspace/reviewer/completed`, icon: FileText, label: "Đã hoàn thành" },
        { href: `/workspace/reviewer/calendar`, icon: Calendar, label: "Lịch trình" },
        { href: `/workspace/reviewer/settings`, icon: Settings, label: "Cài đặt" },
      ],
      guest: [
        { href: `/workspace/guest`, icon: LayoutDashboard, label: "Tổng quan" },
        { href: `/workspace/guest/conferences`, icon: Calendar, label: "Hội nghị" },
        { href: `/workspace/guest/submissions`, icon: FileText, label: "Bài nộp của tôi" },
        { href: `/workspace/guest/favorites`, icon: Calendar, label: "Yêu thích" },
        { href: `/workspace/guest/settings`, icon: Settings, label: "Cài đặt" },
      ],
      collaborator: [
        { href: `/workspace/collaborator`, icon: LayoutDashboard, label: "Tổng quan" },
        { href: `/workspace/collaborator/sponsorships`, icon: Building2, label: "Tài trợ" },
        { href: `/workspace/collaborator/events`, icon: Calendar, label: "Sự kiện" },
        { href: `/workspace/collaborator/analytics`, icon: FileText, label: "Phân tích" },
        { href: `/workspace/collaborator/settings`, icon: Settings, label: "Cài đặt" },
      ],
    };

    return roleSpecificItems[role] || roleSpecificItems.guest;
  };

  const getRoleInfo = () => {
    const roleInfo: Record<string, { name: string; icon: any; color: string }> = {
      admin: { name: "Quản trị viên", icon: Shield, color: "bg-red-500" },
      organizer: { name: "Tổ chức", icon: Building2, color: "bg-purple-500" },
      reviewer: { name: "Đánh giá viên", icon: GraduationCap, color: "bg-orange-500" },
      guest: { name: "Khách", icon: Users, color: "bg-gray-500" },
      collaborator: { name: "Đối tác", icon: Building2, color: "bg-green-500" },
    };
    return roleInfo[role] || roleInfo.guest;
  };

  const handleLogout = () => {
    router.push("/auth/login");
  };

  const menuItems = getMenuItems();
  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CR</span>
              </div>
              <span className="font-bold text-gray-800">ConfRadar</span>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${roleInfo.color} bg-opacity-10`}>
            <div className={`${roleInfo.color} p-2 rounded-lg`}>
              <RoleIcon className="text-white" size={20} />
            </div>
            {isSidebarOpen && (
              <div>
                <p className="text-xs text-gray-600">Vai trò</p>
                <p className="font-semibold text-gray-800">{roleInfo.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">{roleInfo.name}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">AU</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
