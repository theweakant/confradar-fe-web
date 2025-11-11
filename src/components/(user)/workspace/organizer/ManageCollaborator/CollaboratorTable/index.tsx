// import React from "react";
// import {
//   Eye,
//   MoreVertical,
//   Ban,
//   CheckCircle
// } from "lucide-react";

// import { DataTable, Column } from "@/components/molecules/DataTable";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { StatusBadge } from "@/components/atoms/StatusBadge";
// import { UserProfileResponse } from "@/types/user.type";

// interface CollaboratorTableProps {
//   collaborators: UserProfileResponse[];
//   onView: (collaborator: UserProfileResponse) => void;
//   onSuspend: (collaboratorId: string) => void;
//   onActivate: (collaboratorId: string) => void;
// }

// export function CollaboratorTable({
//   collaborators,
//   onView,
//   onSuspend,
//   onActivate
// }: CollaboratorTableProps) {
//   const getRoleLabel = (role: string) => {
//     const labels: Record<string, string> = {
//       customer: "Khách hàng",
//       conferenceorganizer: "Người tổ chức hội nghị",
//       collaborator: "Cộng tác viên",
//       localreviewer: "Phản biện nội bộ",
//       externalreviewer: "Phản biện bên ngoài",
//       admin: "Quản trị viên"
//     };
//     return labels[role] || role;
//   };

//   const getRoleVariant = (role: string): "success" | "danger" | "warning" | "info" => {
//     const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
//       customer: "info",
//       conferenceorganizer: "warning",
//       collaborator: "success",
//       localreviewer: "info",
//       externalreviewer: "warning",
//       admin: "danger"
//     };
//     return variants[role] || "info";
//   };

//   const getStatusLabel = (status: string) => {
//     const labels: Record<string, string> = {
//       active: "Hoạt động",
//       inactive: "Tạm ngưng"
//     };
//     return labels[status] || status;
//   };

//   const getStatusVariant = (status: string): "success" | "danger" | "warning" | "info" => {
//     const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
//       active: "success",
//       inactive: "danger"
//     };
//     return variants[status] || "info";
//   };

//   const columns: Column<UserProfileResponse>[] = [
//     {
//       key: "fullName",
//       header: "Tên cộng tác viên",
//       render: (collaborator) => (
//         <div className="max-w-xs">
//           <p className="font-medium text-gray-900 truncate">{collaborator.fullName}</p>
//           <p className="text-sm text-gray-500 truncate">{collaborator.email}</p>
//         </div>
//       ),
//     },
//     {
//       key: "role",
//       header: "Vai trò",
//       render: (collaborator) => (
//         <StatusBadge
//           status={getRoleLabel(collaborator.role)}
//           variant={getRoleVariant(collaborator.role)}
//         />
//       ),
//     },
//     {
//       key: "status",
//       header: "Trạng thái",
//       render: (collaborator) => (
//         <StatusBadge
//           status={getStatusLabel(collaborator.status)}
//           variant={getStatusVariant(collaborator.status)}
//         />
//       ),
//     },
//     {
//       key: "registeredConferences",
//       header: "Hội nghị được giao",
//       render: (collaborator) => (
//         <span className="text-gray-900 font-medium">
//           {collaborator.registeredConferences || 0}
//         </span>
//       ),
//     },
//     {
//       key: "actions",
//       header: "Thao tác",
//       className: "text-right",
//       render: (collaborator) => (
//         <div className="flex items-center justify-end">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
//                 <MoreVertical className="w-4 h-4 text-gray-600" />
//               </button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem
//                 onClick={() => onView(collaborator)}
//                 className="cursor-pointer"
//               >
//                 <Eye className="w-4 h-4 mr-2" />
//                 Xem chi tiết
//               </DropdownMenuItem>
//               {collaborator.status === "active" ? (
//                 <DropdownMenuItem
//                   onClick={() => onSuspend(collaborator.userId)}
//                   className="cursor-pointer text-orange-600 focus:text-orange-600"
//                 >
//                   <Ban className="w-4 h-4 mr-2" />
//                   Tạm ngưng
//                 </DropdownMenuItem>
//               ) : (
//                 <DropdownMenuItem
//                   onClick={() => onActivate(collaborator.userId)}
//                   className="cursor-pointer text-green-600 focus:text-green-600"
//                 >
//                   <CheckCircle className="w-4 h-4 mr-2" />
//                   Kích hoạt
//                 </DropdownMenuItem>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <DataTable
//       columns={columns}
//       data={collaborators}
//       keyExtractor={(collaborator) => collaborator.userId}
//       emptyMessage="Không tìm thấy cộng tác viên nào"
//     />
//   );
// }