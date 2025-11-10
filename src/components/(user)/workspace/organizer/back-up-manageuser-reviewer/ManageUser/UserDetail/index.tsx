// "use client";

// import {
//   User as UserIcon,
//   Mail,
//   Shield,
//   Activity,
//   Calendar,
//   FileText
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/atoms/StatusBadge";
// import { formatDate } from "@/helper/format";
// import { UserDetailProps } from "@/types/user.type";

// export function UserDetail({ user, onClose }: UserDetailProps) {
//   const getRoleLabel = (role: string) => {
//     const labels: Record<string, string> = {
//       admin: "Quản trị viên",
//       organizer: "Người tổ chức",
//       attendee: "Người tham dự"
//     };
//     return labels[role] || role;
//   };

//   const getRoleVariant = (role: string): "success" | "danger" | "warning" | "info" => {
//     const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
//       admin: "danger",
//       organizer: "info",
//       attendee: "success"
//     };
//     return variants[role] || "info";
//   };

//   const getStatusLabel = (status: string) => {
//     const labels: Record<string, string> = {
//       active: "Hoạt động",
//       inactive: "Không hoạt động"
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

//   return (
//     <div className="space-y-6">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.fullName}</h3>
//           <div className="flex items-center gap-3 mb-4">
//             <StatusBadge
//               status={getRoleLabel(user.role)}
//               variant={getRoleVariant(user.role)}
//             />
//             <StatusBadge
//               status={getStatusLabel(user.status)}
//               variant={getStatusVariant(user.status)}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-4">
//           <div className="flex items-start gap-3">
//             <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Tên người dùng</p>
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
//               <p className="text-gray-900">{getRoleLabel(user.role)}</p>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div className="flex items-start gap-3">
//             <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Trạng thái</p>
//               <p className="text-gray-900">{getStatusLabel(user.status)}</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Số hội thảo đã đăng ký</p>
//               <p className="text-gray-900 font-semibold">{user.registeredConferences} hội thảo</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Ngày tham gia</p>
//               <p className="text-gray-900">{formatDate(user.joinedDate)}</p>
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