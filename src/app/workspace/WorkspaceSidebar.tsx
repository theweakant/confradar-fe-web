"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  Home,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { ElementType } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/auth.slice";
import { persistor } from "@/redux/store";
import { toast } from "sonner";
import { ROLES } from "@/constants/roles";

interface WorkspaceSidebarProps {
  role: string[];
}

export default function WorkspaceSidebar({ role }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  // const normalizedRole = role.toLowerCase().replace(/\s+/g, "");
  const normalizedRoles = role
    .filter(r => typeof r === "string")
    .map(r => r.toLowerCase().replace(/\s+/g, ""));

  // State để quản lý sub-menu  mở/đóng
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  // 👇 Sử dụng constants từ roles.ts
  const roleMenus: Record<
    string,
    { label: string; href: string; icon: ElementType; subMenu?: { label: string; href: string }[] }[]
  > = {
    [ROLES.ADMIN]: [
      { label: "Tổng quan", href: "/workspace/admin", icon: LayoutDashboard },
      {
        label: "Người dùng",
        href: "/workspace/admin/manage-user",
        icon: Users,
      },
      {
        label: "Địa điểm",
        href: "/workspace/admin/manage-accommodation",
        icon: Home,
      },
      {
        label: "Danh mục",
        href: "/workspace/admin/manage-category",
        icon: FileText,
      },
      { label: "Báo cáo", href: "/workspace/admin/report", icon: FileText },
      {
        label: "Cài đặt",
        href: "/workspace/admin/system-setting",
        icon: Settings,
      },
    ],
    [ROLES.CONFERENCE_ORGANIZER]: [
      {
        label: "Tổng quan",
        href: "/workspace/organizer",
        icon: LayoutDashboard,
      },
      {
        label: "Hội nghị",
        href: "/workspace/organizer/manage-conference",
        icon: Calendar,
        subMenu: [
          { label: "Tất cả", href: "/workspace/organizer/manage-conference" },
          { label: "Của tôi", href: "/workspace/organizer/manage-conference/my-conference" },

        ],
      },
      {
        label: "Bài báo",
        href: "/workspace/organizer/manage-paper",
        icon: FileText,
      },
      {
        label: "Địa điểm",
        href: "/workspace/organizer/manage-accommodation",
        icon: Home,
      },
      {
        label: "Quản lý người dùng",
        href: "/workspace/organizer/manage-user",
        icon: Users,
        subMenu: [
          { label: "Người đánh giá", href: "/workspace/organizer/manage-user/manage-reviewer" },
          { label: "Đối tác", href: "/workspace/organizer/manage-user/manage-collaborator" },
          { label: "Khách hàng", href: "/workspace/organizer/manage-user/manage-customer" },
        ],
      },
      // {
      //   label: "Đối tác",
      //   href: "/workspace/organizer/manage-user",
      //   icon: Users,
      // },
      // {
      //   label: "Đánh giá viên",
      //   href: "/workspace/organizer/manage-reviewer",
      //   icon: Users,
      // },
      // {
      //   label: "Yêu cầu",
      //   href: "/workspace/organizer/manage-request",
      //   icon: Building2,
      // },
    ],
    [ROLES.COLLABORATOR]: [
      {
        label: "Tổng quan",
        href: "/workspace/collaborator",
        icon: LayoutDashboard,
      },
      {
        label: "Hội thảo",
        href: "/workspace/collaborator/manage-conference",
        icon: Calendar
      },
      {
        label: "Phân tích",
        href: "/workspace/collaborator/analytics",
        icon: FileText,
      },
      {
        label: "Cài đặt",
        href: "/workspace/collaborator/settings",
        icon: Settings,
      },
    ],
    [ROLES.LOCAL_REVIEWER]: [
      {
        label: "Tổng quan",
        href: "/workspace/local-reviewer",
        icon: LayoutDashboard,
      },
      {
        label: "Bài báo được giao",
        href: "/workspace/local-reviewer/manage-paper",
        icon: FileText,
      },
      {
        label: "Đã hoàn thành",
        href: "/workspace/local-reviewer/completed",
        icon: FileText,
      },
    ],
    [ROLES.EXTERNAL_REVIEWER]: [
      {
        label: "Tổng quan",
        href: "/workspace/external-reviewer",
        icon: LayoutDashboard,
      },
      {
        label: "Bài cần đánh giá",
        href: "/workspace/external-reviewer/manage-paper",
        icon: FileText,
      },
      {
        label: "Đã hoàn thành",
        href: "/workspace/external-reviewer/completed",
        icon: FileText,
      },
      {
        label: "Bài đánh giá ngoài",
        href: "/workspace/reviewer-outsource",
        icon: GraduationCap,
      },
      {
        label: "Lịch trình",
        href: "/workspace/reviewer-outsource/schedule",
        icon: Calendar,
      },
    ],
  };

  const roleInfo: Record<
    string,
    { name: string; color: string; icon: ElementType }
  > = {
    [ROLES.ADMIN]: { name: "Quản trị viên", color: "bg-red-500", icon: Shield },
    [ROLES.CONFERENCE_ORGANIZER]: {
      name: "Tổ chức",
      color: "bg-purple-500",
      icon: Building2,
    },
    [ROLES.COLLABORATOR]: {
      name: "Đối tác",
      color: "bg-green-500",
      icon: Building2,
    },
    [ROLES.LOCAL_REVIEWER]: {
      name: "Đánh giá nội bộ",
      color: "bg-yellow-500",
      icon: GraduationCap,
    },
    [ROLES.EXTERNAL_REVIEWER]: {
      name: "Đánh giá ngoài",
      color: "bg-orange-500",
      icon: GraduationCap,
    },
  };

  // const roleMenu = roleMenus[normalizedRole] ?? [];

  const allMenus = normalizedRoles.flatMap(r => roleMenus[r] ?? []);

  const activeRole = normalizedRoles.find(r =>
    (roleMenus[r] ?? []).some(item =>
      item.href === pathname ||
      item.subMenu?.some(sub => sub.href === pathname)
    )
  );

  const info = roleInfo[activeRole ?? ""] ?? {
    name: "Không xác định",
    color: "bg-gray-400",
    icon: Shield,
  };
  const RoleIcon = info.icon;

  const handleLogout = async () => {
    try {
      dispatch(logout());
      await persistor.purge();
      toast.success("Đăng xuất thành công!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 300);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
      router.push("/auth/login");
    }
  };

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
        <div
          className={`flex items-center gap-3 p-3 rounded-lg ${info.color} bg-opacity-10`}
        >
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
          {allMenus.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const hasSubMenu = item.subMenu && item.subMenu.length > 0;
            const isSubMenuActive = item.subMenu?.some(sub => pathname === sub.href);
            const isSubMenuOpen = openSubMenus[item.href] ?? isSubMenuActive;

            return (
              <div key={item.href}>
                {hasSubMenu ? (
                  <>
                    <button
                      onClick={() => setOpenSubMenus(prev => ({ ...prev, [item.href]: !isSubMenuOpen }))}
                      className={`flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-colors ${isSubMenuActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        {isSidebarOpen && <span>{item.label}</span>}
                      </div>
                      {isSidebarOpen && (
                        isSubMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </button>
                    {isSidebarOpen && isSubMenuOpen && (
                      <div className="ml-9 mt-1 space-y-1">
                        {item.subMenu?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${pathname === subItem.href
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                              }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon size={20} />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                )}
              </div>
            );
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
  );
};

