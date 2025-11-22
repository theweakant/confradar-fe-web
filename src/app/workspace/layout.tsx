// "use client";

// import RouteGuard from "@/utils/routeGuard";
// import WorkspaceSidebar from "./WorkspaceSidebar";
// import { Bell, Search } from "lucide-react";
// import { useAuth } from "@/redux/hooks/useAuth";
// import { useProfile } from "@/redux/hooks/useProfile";

// export default function WorkspaceLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user } = useAuth();
//   const { profile, isLoading } = useProfile();

//   const roles: string[] = user?.role ?? [];

//   const fullName = profile?.fullName || user?.email || "User";

//   // Tạo initials từ fullName
//   const initials = fullName
//     .split(" ")
//     .map((word) => word[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);

//   return (
//     <RouteGuard
//       allowedRoles={[
//         "Admin",
//         "ConferenceOrganizer",
//         "Collaborator",
//         "LocalReviewer",
//         "ExternalReviewer",
//         "HeadReviewer",
//       ]}
//     >
//       <div className="flex h-screen bg-gray-50">
//         {/* Sidebar */}
//         <WorkspaceSidebar role={roles} />

//         {/* Content */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Header */}
//           <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
//             <div className="flex items-center gap-4 flex-1">
//               <div className="relative flex-1 max-w-md">
//                 <Search
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                   size={20}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Tìm kiếm..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-4">
//               <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                 <Bell size={20} className="text-gray-600" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//               </button>

//               <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
//                 <div className="text-right">
//                   <p className="text-sm font-medium text-gray-800">
//                     {isLoading ? "Đang tải..." : fullName}
//                   </p>
//                   <p className="text-xs text-gray-500 capitalize">{roles.join(", ")}</p>
//                 </div>
//                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
//                   <span className="text-white font-semibold text-sm">
//                     {initials}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </header>

//           {/* Page content */}
//           <main className="flex-1 overflow-y-auto p-6">{children}</main>
//         </div>
//       </div>
//     </RouteGuard>
//   );
// }


"use client";

import { useRouter } from "next/navigation"; 
import RouteGuard from "@/utils/routeGuard";
import WorkspaceSidebar from "./WorkspaceSidebar";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/redux/hooks/useAuth";
import { useProfile } from "@/redux/hooks/useProfile";

// 👇 Mock dữ liệu thông báo — thay bằng Redux/API sau này
import { Notification } from "@/types/notification.type";
const mockNotifications: Notification[] = [
  {
    notificationId: "noti_001",
    userId: "user_123",
    title: "Hội nghị mới phù hợp với bạn",
    message: "International Conference on Artificial Intelligence 2025 đang mở đăng ký.",
    type: "SYSTEM",
    createdAt: "2025-11-21T10:15:30.000Z",
    readStatus: false,
  },
  {
    notificationId: "noti_002",
    userId: "user_123",
    title: "Nhắc nhở: Deadline sắp hết hạn",
    message: "Hạn nộp bài cho ICSE 2026 còn 3 ngày.",
    type: "SYSTEM",
    createdAt: "2025-11-20T14:30:00.000Z",
    readStatus: false,
  },
  {
    notificationId: "noti_003",
    userId: "user_123",
    title: "Kết quả tìm kiếm",
    message: "Tìm thấy 15 hội nghị về ML.",
    type: "SYSTEM",
    createdAt: "2025-11-18T16:45:00.000Z",
    readStatus: true,
  },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const router = useRouter(); // 👈 Khởi tạo router

  const roles: string[] = user?.role ?? [];
  const fullName = profile?.fullName || user?.email || "User";

  // Tạo initials từ fullName
  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // 👇 Tính số thông báo chưa đọc
  const unreadCount = mockNotifications.filter((n) => !n.readStatus).length;

  // 👇 Xử lý khi bấm icon chuông
  const handleBellClick = () => {
    router.push("/notifications");
  };

  return (
    <RouteGuard
      allowedRoles={[
        "Admin",
        "ConferenceOrganizer",
        "Collaborator",
        "LocalReviewer",
        "ExternalReviewer",
        "HeadReviewer",
      ]}
    >
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <WorkspaceSidebar role={roles} />

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 🔔 Icon Bell — cập nhật ở đây */}
              <button
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleBellClick} // 👈 Thêm onClick
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {isLoading ? "Đang tải..." : fullName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {roles.join(", ")}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {initials}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}