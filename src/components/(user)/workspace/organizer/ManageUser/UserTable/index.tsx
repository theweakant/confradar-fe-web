// import React from "react";
// import { Eye, MoreVertical, Ban, CheckCircle } from "lucide-react";

// import { DataTable, Column } from "@/components/molecules/DataTable";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { StatusBadge } from "@/components/atoms/StatusBadge";
// import { UserProfileResponse } from "@/types/user.type";

// interface UserTableProps {
//   users: UserProfileResponse[];
//   onView: (user: UserProfileResponse) => void;
//   onSuspend: (userId: string) => void;
//   onActivate: (userId: string) => void;
// }

// export function UserTable({
//   users,
//   onView,
//   onSuspend,
//   onActivate,
// }: UserTableProps) {
//   const getRoleLabel = (role: string) => {
//     const labels: Record<string, string> = {
//       customer: "Khách hàng",
//       conferenceorganizer: "Người tổ chức hội nghị",
//       collaborator: "Cộng tác viên",
//       localreviewer: "Phản biện nội bộ",
//       externalreviewer: "Phản biện bên ngoài",
//       admin: "Quản trị viên",
//     };
//     return labels[role] || role;
//   };

//   const getRoleVariant = (
//     role: string,
//   ): "success" | "danger" | "warning" | "info" => {
//     const variants: Record<string, "success" | "danger" | "warning" | "info"> =
//       {
//         customer: "info",
//         conferenceorganizer: "warning",
//         collaborator: "success",
//         localreviewer: "info",
//         externalreviewer: "warning",
//         admin: "danger",
//       };
//     return variants[role] || "info";
//   };

//   const columns: Column<UserProfileResponse>[] = [
//     {
//       key: "fullName",
//       header: "Tên người dùng",
//       render: (user) => (
//         <div className="max-w-xs">
//           <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
//           <p className="text-sm text-gray-500 truncate">{user.email}</p>
//         </div>
//       ),
//     },
//     {
//       key: "role",
//       header: "Vai trò",
//       render: (user) => {
//         const primaryRole = user.roles?.[0] ?? "User";
//         return (
//           <StatusBadge
//             status={getRoleLabel(primaryRole)}
//             variant={getRoleVariant(primaryRole)}
//           />
//         );
//       },
//     },
//     {
//       key: "actions",
//       header: "Thao tác",
//       className: "text-right",
//       render: (user) => (
//         <div className="flex items-center justify-end">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
//                 <MoreVertical className="w-4 h-4 text-gray-600" />
//               </button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem
//                 onClick={() => onView(user)}
//                 className="cursor-pointer"
//               >
//                 <Eye className="w-4 h-4 mr-2" />
//                 Xem chi tiết
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => onSuspend(user.userId)}
//                 className="cursor-pointer text-orange-600 focus:text-orange-600"
//               >
//                 <Ban className="w-4 h-4 mr-2" />
//                 Tạm ngưng
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => onActivate(user.userId)}
//                 className="cursor-pointer text-green-600 focus:text-green-600"
//               >
//                 <CheckCircle className="w-4 h-4 mr-2" />
//                 Kích hoạt
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <DataTable
//       columns={columns}
//       data={users}
//       keyExtractor={(user) => user.userId}
//       emptyMessage="Không tìm thấy người dùng nào"
//     />
//   );
// }
