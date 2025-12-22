// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState } from "react";
// import {
//   LayoutDashboard,
//   Users,
//   FileText,
//   Calendar,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   Shield,
//   Building2,
//   GraduationCap,
//   Home,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";
// import type { ElementType } from "react";
// import { useDispatch } from "react-redux";
// import { logout } from "@/redux/slices/auth.slice";
// import { persistor } from "@/redux/store";
// import { toast } from "sonner";
// import { ROLES } from "@/constants/roles";

// interface WorkspaceSidebarProps {
//   role: string[];
// }

// export default function WorkspaceSidebar({ role }: WorkspaceSidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const dispatch = useDispatch();
//   const normalizedRoles = role
//     .filter(r => typeof r === "string")
//     .map(r => r.toLowerCase().replace(/\s+/g, ""));


//   const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});


//   const roleMenus: Record<
//     string,
//     { label: string; href: string; icon: ElementType; subMenu?: { label: string; href: string }[] }[]
//   > = {
//     [ROLES.ADMIN]: [
//       { label: "Tổng quan", href: "/workspace/admin", icon: LayoutDashboard },
//       // {
//       //   label: "Người dùng",
//       //   href: "/workspace/admin/manage-user",
//       //   icon: Users,
//       // },
//       {
//         label: "Địa điểm",
//         href: "/workspace/admin/manage-accommodation",
//         icon: Home,
//       },
//       {
//         label: "Danh mục",
//         href: "/workspace/admin/manage-category",
//         icon: FileText,
//       },
//       { label: "Báo cáo", href: "/workspace/admin/report", icon: FileText },
//       {
//         label: "Log hệ thống",
//         href: "/workspace/admin/system-logs",
//         icon: Settings,
//       },
//       // {
//       //   label: "Cài đặt",
//       //   href: "/workspace/admin/system-setting",
//       //   icon: Settings,
//       // },
//     ],
//     [ROLES.CONFERENCE_ORGANIZER]: [
//       {
//         label: "Tổng quan",
//         href: "/workspace/organizer",
//         icon: LayoutDashboard,
//       },
//       {
//         label: "Hội nghị",
//         href: "/workspace/organizer/manage-conference",
//         icon: Calendar,
//         subMenu: [
//           { label: "ConfRadar", href: "/workspace/organizer/manage-conference" },
//           { label: "Đối tác", href: "/workspace/organizer/manage-conference/external-conference" },

//         ],
//       },
//       // {
//       //   label: "Bài báo",
//       //   href: "/workspace/organizer/manage-paper",
//       //   icon: FileText,
//       // },
//       {
//         label: "Địa điểm",
//         href: "/workspace/organizer/manage-accommodation",
//         icon: Home,
//       },
//       {
//         label: "Quản lý người dùng",
//         href: "/workspace/organizer/manage-user",
//         icon: Users,
//         subMenu: [
//           { label: "Người đánh giá", href: "/workspace/organizer/manage-user/manage-reviewer" },
//           { label: "Đối tác", href: "/workspace/organizer/manage-user/manage-collaborator" },
//           { label: "Khách hàng", href: "/workspace/organizer/manage-user/manage-customer" },
//         ],
//       },
//       {
//         label: "Lịch trình",
//         href: "/workspace/organizer/conference-calendar",
//         icon: FileText,
//       },
//       // {
//       //   label: "Đối tác",
//       //   href: "/workspace/organizer/manage-user",
//       //   icon: Users,
//       // },
//       // {
//       //   label: "Đánh giá viên",
//       //   href: "/workspace/organizer/manage-reviewer",
//       //   icon: Users,
//       // },
//       // {
//       //   label: "Yêu cầu",
//       //   href: "/workspace/organizer/manage-request",
//       //   icon: Building2,
//       // },
//     ],
//     [ROLES.COLLABORATOR]: [
//       {
//         label: "Tổng quan",
//         href: "/workspace/collaborator",
//         icon: LayoutDashboard,
//       },
//       {
//         label: "Hội thảo",
//         href: "/workspace/collaborator/manage-conference",
//         icon: Calendar
//       },
//       {
//         label: "Lịch trình",
//         href: "/workspace/collaborator/conference-calendar",
//         icon: FileText,
//       },
//       {
//         label: "Hợp đồng",
//         href: "/workspace/collaborator/contract",
//         icon: Settings,
//       },
//     ],
//     [ROLES.LOCAL_REVIEWER]: [
//       {
//         label: "Tổng quan",
//         href: "/workspace/local-reviewer",
//         icon: LayoutDashboard,
//       },
//       {
//         label: "Bài báo được giao",
//         // href: "/workspace/local-reviewer/manage-paper",
//         href: "/workspace/local-reviewer/manage-paper/conferences-has-assigned-papers",
//         icon: FileText,
//       },
//       // {
//       //   label: "Đã hoàn thành",
//       //   href: "/workspace/local-reviewer/completed",
//       //   icon: FileText,
//       // },
//     ],
//     [ROLES.EXTERNAL_REVIEWER]: [
//       {
//         label: "Tổng quan",
//         href: "/workspace/external-reviewer",
//         icon: LayoutDashboard,
//       },
//       {
//         label: "Bài cần đánh giá",
//         href: "/workspace/external-reviewer/manage-paper/conferences-has-assigned-papers",
//         icon: FileText,
//       },
//       {
//         label: "Hợp đồng của bạn",
//         href: "/workspace/external-reviewer/contract",
//         icon: GraduationCap,
//       },
//       // {
//       //   label: "Lịch trình",
//       //   href: "/workspace/reviewer-outsource/schedule",
//       //   icon: Calendar,
//       // },
//     ],
//   };

//   const roleInfo: Record<
//     string,
//     { name: string; color: string; icon: ElementType }
//   > = {
//     [ROLES.ADMIN]: { name: "Quản trị viên", color: "bg-red-500", icon: Shield },
//     [ROLES.CONFERENCE_ORGANIZER]: {
//       name: "Tổ chức",
//       color: "bg-purple-500",
//       icon: Building2,
//     },
//     [ROLES.COLLABORATOR]: {
//       name: "Đối tác",
//       color: "bg-green-500",
//       icon: Building2,
//     },
//     [ROLES.LOCAL_REVIEWER]: {
//       name: "Đánh giá nội bộ",
//       color: "bg-yellow-500",
//       icon: GraduationCap,
//     },
//     [ROLES.EXTERNAL_REVIEWER]: {
//       name: "Đánh giá bên ngoài",
//       color: "bg-orange-500",
//       icon: GraduationCap,
//     },
//   };

//   // const roleMenu = roleMenus[normalizedRole] ?? [];

//   const allMenus = normalizedRoles.flatMap(r => roleMenus[r] ?? []);

//   const activeRole = normalizedRoles.find(r =>
//     (roleMenus[r] ?? []).some(item =>
//       item.href === pathname ||
//       item.subMenu?.some(sub => sub.href === pathname)
//     )
//   );

//   const info = roleInfo[activeRole ?? ""] ?? {
//     name: "Không xác định",
//     color: "bg-gray-400",
//     icon: Shield,
//   };
//   const RoleIcon = info.icon;

//   const handleLogout = async () => {
//     try {
//       dispatch(logout());
//       await persistor.purge();
//       toast.success("Đăng xuất thành công!");
//       setTimeout(() => {
//         router.push("/auth/login");
//       }, 300);
//     } catch (error) {
//       console.error("Logout error:", error);
//       toast.error("Có lỗi xảy ra khi đăng xuất");
//       router.push("/auth/login");
//     }
//   };

//   return (
//     <aside
//       className={`${isSidebarOpen ? "w-64" : "w-20"
//         } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
//     >
//       {/* Logo + Toggle */}
//       <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
//         {isSidebarOpen && (
//           <Link href="/" className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-sm">CR</span>
//             </div>
//             <span className="font-bold text-gray-800">ConfRadar</span>
//           </Link>
//         )}
//         <button
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
//         </button>
//       </div>

//       {/* Role badge */}
//       <div className="px-4 py-4 border-b border-gray-200">
//         <div
//           className={`flex items-center gap-3 p-3 rounded-lg ${info.color} bg-opacity-10`}
//         >
//           <div className={`${info.color} p-2 rounded-lg`}>
//             <RoleIcon className="text-white" size={20} />
//           </div>
//           {isSidebarOpen && (
//             <div>
//               <p className="text-xs text-gray-600">Vai trò</p>
//               <p className="font-semibold text-gray-800">{info.name}</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-3 py-4 overflow-y-auto">
//         <div className="space-y-1">
//           {allMenus.map((item) => {
//             const Icon = item.icon;
//             const active = pathname === item.href;
//             const hasSubMenu = item.subMenu && item.subMenu.length > 0;
//             const isSubMenuActive = item.subMenu?.some(sub => pathname === sub.href);
//             const isSubMenuOpen = openSubMenus[item.href] ?? isSubMenuActive;

//             return (
//               <div key={item.href}>
//                 {hasSubMenu ? (
//                   <>
//                     <button
//                       onClick={() => setOpenSubMenus(prev => ({ ...prev, [item.href]: !isSubMenuOpen }))}
//                       className={`flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-colors ${isSubMenuActive
//                         ? "bg-blue-50 text-blue-600 font-medium"
//                         : "text-gray-700 hover:bg-gray-100"
//                         }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <Icon size={20} />
//                         {isSidebarOpen && <span>{item.label}</span>}
//                       </div>
//                       {isSidebarOpen && (
//                         isSubMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
//                       )}
//                     </button>
//                     {isSidebarOpen && isSubMenuOpen && (
//                       <div className="ml-9 mt-1 space-y-1">
//                         {item.subMenu?.map((subItem) => (
//                           <Link
//                             key={subItem.href}
//                             href={subItem.href}
//                             className={`block px-3 py-2 rounded-lg text-sm transition-colors ${pathname === subItem.href
//                               ? "bg-blue-50 text-blue-600 font-medium"
//                               : "text-gray-600 hover:bg-gray-100"
//                               }`}
//                           >
//                             {subItem.label}
//                           </Link>
//                         ))}
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <Link
//                     href={item.href}
//                     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
//                       ? "bg-blue-50 text-blue-600 font-medium"
//                       : "text-gray-700 hover:bg-gray-100"
//                       }`}
//                   >
//                     <Icon size={20} />
//                     {isSidebarOpen && <span>{item.label}</span>}
//                   </Link>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-gray-200">
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
//         >
//           <LogOut size={20} />
//           {isSidebarOpen && <span>Đăng xuất</span>}
//         </button>
//       </div>
//     </aside>
//   );
// };
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
  Flag,
  ClipboardClock,
  Receipt,
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
  const normalizedRoles = role
    .filter(r => typeof r === "string")
    .map(r => r.toLowerCase().replace(/\s+/g, ""));

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const roleMenus: Record<
    string,
    { label: string; href: string; icon: ElementType; subMenu?: { label: string; href: string }[] }[]
  > = {
    [ROLES.ADMIN]: [
      { label: "Tổng quan", href: "/workspace/admin", icon: LayoutDashboard },
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
      // {
      // label: "Nhà xuất bản",
      // href: "/workspace/admin/manage-publisher",
      // icon: BookOpen,
      // },
      { label: "Báo cáo", href: "/workspace/admin/report", icon: Flag },
      {
        label: "Log hệ thống",
        href: "/workspace/admin/system-logs",
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
          { label: "ConfRadar", href: "/workspace/organizer/manage-conference" },
          { label: "Đối tác", href: "/workspace/organizer/manage-conference/external-conference" },
        ],
      },
      {
        label: "Địa điểm",
        href: "/workspace/organizer/manage-accommodation",
        icon: Home,
      },
      // {
      // label: "Nhà xuất bản",
      // href: "/workspace/organizer/manage-publisher",
      // icon: BookOpen,
      // },
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
      {
        label: "Lịch trình",
        href: "/workspace/organizer/conference-calendar",
        icon: ClipboardClock,
      },
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
        icon: Calendar,
      },
      {
        label: "Lịch trình",
        href: "/workspace/collaborator/conference-calendar",
        icon: ClipboardClock,
      },
      {
        label: "Hợp đồng",
        href: "/workspace/collaborator/contract",
        icon: Receipt,
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
        href: "/workspace/local-reviewer/manage-paper/conferences-has-assigned-papers",
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
        href: "/workspace/external-reviewer/manage-paper/conferences-has-assigned-papers",
        icon: FileText,
      },
      {
        label: "Hợp đồng của bạn",
        href: "/workspace/external-reviewer/contract",
        icon: GraduationCap,
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
      name: "Đánh giá bên ngoài",
      color: "bg-orange-500",
      icon: GraduationCap,
    },
  };

  const allMenus = normalizedRoles.flatMap(r => roleMenus[r] ?? []);

  // const activeRole = normalizedRoles.find(r =>
  //   (roleMenus[r] ?? []).some(item =>
  //     item.href === pathname ||
  //     item.subMenu?.some(sub => sub.href === psathname)
  //   )
  // );

const activeRole = normalizedRoles.find(r =>
  (roleMenus[r] ?? []).some(item => {
    if (pathname === item.href) return true;

    if (pathname.startsWith(item.href + "/")) return true;
    if (item.subMenu?.some(sub => 
      pathname === sub.href || pathname.startsWith(sub.href + "/")
    )) return true;
    
    return false;
  })
);

  const info = roleInfo[activeRole ?? ""] ?? {
    name: "Không xác định",
    color: "bg-gray-400",
    icon: Shield,
  };

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
        } bg-[#FAFAFA] border-r border-gray-200 transition-all duration-300 flex flex-col`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {isSidebarOpen && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <div className="bg-white rounded-tl-sm"></div>
                <div className="bg-white rounded-tr-sm"></div>
                <div className="bg-white rounded-bl-sm"></div>
                <div className="bg-white rounded-br-sm"></div>
              </div>
            </div>
            <span className="font-semibold text-gray-800 text-base">ConfRadar</span>
          </Link>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
        </button>
      </div>

      {/* Role badge */}
      {isSidebarOpen && (
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex justify-center">
            <span
              className={`${info.color.replace('bg-', 'text-')} font-bold text-base`}
            >
              {info.name}
            </span>
          </div>
        </div>
      )}

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
                      className={`flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isSubMenuActive
                        ? "bg-white text-gray-900 font-medium shadow-sm"
                        : "text-gray-600 hover:bg-white hover:text-gray-900"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} strokeWidth={isSubMenuActive ? 2.5 : 2} />
                        {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                      </div>
                      {isSidebarOpen && (
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>
                    {isSidebarOpen && isSubMenuOpen && (
                      <div className="ml-3 mt-1 mb-2 pl-6 border-l-2 border-gray-200 space-y-1">
                        {item.subMenu?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${pathname === subItem.href
                              ? "bg-white text-gray-900 font-medium shadow-sm"
                              : "text-gray-600 hover:bg-white hover:text-gray-900"
                              }`}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${active
                      ? "bg-white text-gray-900 font-medium shadow-sm"
                      : "text-gray-600 hover:bg-white hover:text-gray-900"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                      {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                    </div>
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          {isSidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}