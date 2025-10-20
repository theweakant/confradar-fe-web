// "use client";

// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import { ChevronRight, Home } from "lucide-react";
// import { ReactNode } from "react";

// interface BreadcrumbItem {
//   label: string;
//   href?: string;
// }

// function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
//   return (
//     <nav className="flex items-center space-x-2 text-sm mb-6">
//       <Link
//         href="/workspace"
//         className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
//       >
//         <Home className="w-4 h-4" />
//       </Link>
      
//       {items.map((item, index) => (
//         <div key={index} className="flex items-center space-x-2">
//           <ChevronRight className="w-4 h-4 text-gray-400" />
//           {item.href && index !== items.length - 1 ? (
//             <Link
//               href={item.href}
//               className="text-gray-500 hover:text-gray-700 transition-colors"
//             >
//               {item.label}
//             </Link>
//           ) : (
//             <span className="text-gray-900 font-medium">{item.label}</span>
//           )}
//         </div>
//       ))}
//     </nav>
//   );
// }

// export default function ReviewerLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const pathname = usePathname();

//   // Generate breadcrumb items based on pathname
//   const getBreadcrumbItems = (): BreadcrumbItem[] => {
//     const items: BreadcrumbItem[] = [
//       { label: "Reviewer", href: "/workspace/reviewer" }
//     ];

//     // Quản lý bài báo (Bài cần đánh giá)
//     if (pathname.includes("/manage-paper")) {
//       items.push({
//         label: "Bài cần đánh giá",
//         href: "/workspace/reviewer/manage-paper",
//       });

//       if (pathname.includes("/assigned-papper-list")) {
//         items.push({
//           label: "Danh sách phân công",
//           href: "/workspace/reviewer/manage-paper/assigned-papper-list",
//         });

//         if (pathname.includes("/review-paper")) {
//           items.push({
//             label: "Đánh giá bài báo",
//           });
//         }
//       }
//     }

//     // Đã hoàn thành
//     if (pathname.includes("/completed")) {
//       items.push({
//         label: "Đã hoàn thành",
//       });
//     }

//     // Lịch trình
//     if (pathname.includes("/schedule")) {
//       items.push({
//         label: "Lịch trình",
//       });
//     }

//     // Cài đặt
//     if (pathname.includes("/settings")) {
//       items.push({
//         label: "Cài đặt",
//       });
//     }

//     // Remove href from last item (current page)
//     if (items.length > 0) {
//       const lastItem = items[items.length - 1];
//       items[items.length - 1] = { label: lastItem.label };
//     }

//     return items;
//   };

//   const breadcrumbItems = getBreadcrumbItems();

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* Main Content with Breadcrumb */}
//       <div className="max-w-7xl mx-auto p-6">
//         <Breadcrumb items={breadcrumbItems} />
//         {children}
//       </div>
//     </div>
//   );
// }

"use client"

import { ROLES } from "@/constants/roles"
import RouteGuard from "@/utils/routeGuard"

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={[ROLES.LOCAL_REVIEWER, ROLES.EXTERNAL_REVIEWER]}>
      {children}
    </RouteGuard>
  )
}
