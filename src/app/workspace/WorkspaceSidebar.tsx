"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Building2,
  GraduationCap,
  Home
} from "lucide-react"
import type { ElementType } from "react"


interface WorkspaceSidebarProps {
  role: string
}

const WorkspaceSidebar = ({ role }: WorkspaceSidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const roleMenus: Record<string, { label: string; href: string; icon: ElementType }[]> = {
    admin: [
      { label: "Tổng quan", href: "/workspace/admin", icon: LayoutDashboard },
      { label: "Người dùng", href: "/workspace/admin/manage-user", icon: Users },
      // { label: "Hội nghị", href: "/workspace/admin/manage-conference", icon: Calendar },
      { label: "Địa điểm", href: "/workspace/admin/manage-accommodation", icon: Home },
      { label: "Danh mục", href: "/workspace/admin/manage-category", icon: FileText },
      { label: "Báo cáo", href: "/workspace/admin/report", icon: FileText },
      { label: "Cài đặt", href: "/workspace/admin/system-setting", icon: Settings },
    ],
    organizer: [
      { label: "Tổng quan", href: "/workspace/organizer", icon: LayoutDashboard },
      { label: "Hội nghị", href: "/workspace/organizer/manage-conference", icon: Calendar },
      { label: "Bài báo", href: "/workspace/organizer/manage-paper", icon: FileText },
      { label: "Người tham gia", href: "/workspace/organizer/manage-user", icon: Users },
      { label: "Quản lí phản biện", href: "/workspace/organizer/manage-reviewer", icon: Users },
      { label: "Yêu cầu", href: "/workspace/organizer/manage-request", icon: Building2 },

    ],
    collaborator: [
      { label: "Tổng quan", href: "/workspace/collaborator", icon: LayoutDashboard },
      { label: "Tài trợ", href: "/workspace/collaborator/sponsorships", icon: Building2 },
      { label: "Hội thảo", href: "/workspace/collaborator/manage-conference", icon: Calendar },
      { label: "Phân tích", href: "/workspace/collaborator/analytics", icon: FileText },
      { label: "Cài đặt", href: "/workspace/collaborator/settings", icon: Settings },
    ],

    "local-reviewer": [
      { label: "Tổng quan", href: "/workspace/local-reviewer", icon: LayoutDashboard },
      { label: "Bài cần đánh giá", href: "/workspace/local-reviewer/manage-paper", icon: FileText },
      { label: "Đã hoàn thành", href: "/workspace/local-reviewer/completed", icon: FileText },
    ],

    "external-reviewer": [
      { label: "Tổng quan", href: "/workspace/external-reviewer", icon: LayoutDashboard },
      { label: "Bài cần đánh giá", href: "/workspace/external-reviewer/manage-paper", icon: FileText },
      { label: "Đã hoàn thành", href: "/workspace/external-reviewer/completed", icon: FileText },
      { label: "Bài đánh giá ngoài", href: "/workspace/reviewer-outsource", icon: GraduationCap },
      { label: "Lịch trình", href: "/workspace/reviewer-outsource/schedule", icon: Calendar },
    ],
    // guest: [
    //   { label: "Tổng quan", href: "/workspace/guest", icon: LayoutDashboard },
    //   { label: "Hội nghị", href: "/workspace/guest/conferences", icon: Calendar },
    // ],
  }

  const roleInfo: Record<string, { name: string; color: string; icon: ElementType }> = {
    admin: { name: "Quản trị viên", color: "bg-red-500", icon: Shield },
    organizer: { name: "Tổ chức", color: "bg-purple-500", icon: Building2 },
    collaborator: { name: "Đối tác", color: "bg-green-500", icon: Building2 },
    // reviewer: { name: "Đánh giá viên", color: "bg-orange-500", icon: GraduationCap },
    "local-reviewer": { name: "Đánh giá nội bộ", color: "bg-yellow-500", icon: GraduationCap },
    "external-reviewer": { name: "Đánh giá ngoài", color: "bg-yellow-500", icon: GraduationCap },
    guest: { name: "Khách", color: "bg-gray-500", icon: Users },
  }

  const roleMenu = roleMenus[role] || roleMenus.guest
  const info = roleInfo[role] || roleInfo.guest
  const RoleIcon = info.icon

  const handleLogout = () => {
    router.push("/auth/login")
  }

  return (
    <aside
      className={`${isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
    >
      {/* Logo + Toggle */}
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

      {/* Role badge */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${info.color} bg-opacity-10`}>
          <div className={`${info.color} p-2 rounded-lg`}>
            <RoleIcon className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <div>
              <p className="text-xs text-gray-600">Vai trò</p>
              <p className="font-semibold text-gray-800">{info.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {roleMenu.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
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
  )
}

export default WorkspaceSidebar
