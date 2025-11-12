// "use client";

// import {
//   User as UserIcon,
//   Mail,
//   Shield,
//   FileText,
//   Calendar,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/atoms/StatusBadge";
// import { formatDate } from "@/helper/format";
// import { UserDetailProps } from "@/types/user.type";

// export function UserDetail({ user, onClose }: UserDetailProps) {
//   // Lấy vai trò chính (vai trò đầu tiên), fallback là "attendee"
//   const primaryRole = user.roles?.[0] ?? "User";

//   const getRoleLabel = (role: string) => {
//     const labels: Record<string, string> = {
//       admin: "Quản trị viên",
//       organizer: "Người tổ chức",
//       attendee: "Người tham dự",
//     };
//     return labels[role] || role;
//   };

//   const getRoleVariant = (
//     role: string,
//   ): "success" | "danger" | "warning" | "info" => {
//     const variants: Record<string, "success" | "danger" | "warning" | "info"> =
//       {
//         admin: "danger",
//         organizer: "info",
//         attendee: "success",
//       };
//     return variants[role] || "info";
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <h3 className="text-2xl font-bold text-gray-900 mb-2">
//             {user.fullName}
//           </h3>
//           <div className="flex items-center gap-3 mb-4">
//             <StatusBadge
//               status={getRoleLabel(primaryRole)}
//               variant={getRoleVariant(primaryRole)}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-4">
//           <div className="flex items-start gap-3">
//             <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">
//                 Tên người dùng
//               </p>
//               <p className="text-gray-900">{user.fullName}</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Email</p>
//               <p className="text-gray-900">{user.email}</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Vai trò</p>
//               <p className="text-gray-900">{getRoleLabel(primaryRole)}</p>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className="flex items-start gap-3">
//             <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">
//                 Số hội thảo đã đăng ký
//               </p>

//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Ngày tham gia</p>
//               <p className="text-gray-900">{formatDate(user.createdAt)}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-end pt-4 border-t">
//         <Button
//           onClick={onClose}
//           className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//         >
//           Đóng
//         </Button>
//       </div>
//     </div>
//   );
// }