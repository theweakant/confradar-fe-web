// "use client";

// import { useState, useEffect } from "react";
// import { Search, Plus, Users } from "lucide-react";
// import { Modal } from "@/components/molecules/Modal";
// import { SearchBar } from "@/components/molecules/SearchBar";
// import { StatCard } from "@/components/molecules/StatCard";
// import { LocalReviewerTable } from "./LocalReviewerTable";
// import { LocalReviewerDetail } from "./LocalReviewerDetail";
// import { LocalReviewerForm } from "./LocalReviewerForm";
// import {
//   useGetAllUsersQuery,
//   useSuspendUserMutation,
//   useActivateUserMutation,
//   useCreateCollaboratorMutation
// } from "@/redux/services/user.service";
// import { UserProfileResponse } from "@/types/user.type";
// import { CollaboratorRequest } from "@/types/user.type";

// export default function ManageLocalReviewer() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedReviewer, setSelectedReviewer] = useState<UserProfileResponse | null>(null);
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//   const [isFormModalOpen, setIsFormModalOpen] = useState(false);

//   // API hooks
//   const {
//     data: allUsers = [],
//     isLoading,
//     error,
//     refetch
//   } = useGetAllUsersQuery();

//   const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
//   const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
//   const [createCollaborator, { isLoading: isCreating }] = useCreateCollaboratorMutation();

//   // Filter users to only show local reviewers
//   const localReviewers = allUsers.filter(
//     user => user.role === "localreviewer"
//   );

//   // Search functionality
//   const filteredReviewers = localReviewers.filter(reviewer =>
//     reviewer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     reviewer.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleViewReviewer = (reviewer: UserProfileResponse) => {
//     setSelectedReviewer(reviewer);
//     setIsDetailModalOpen(true);
//   };

//   const handleSuspendReviewer = async (userId: string) => {
//     try {
//       await suspendUser(userId).unwrap();
//       refetch();
//       console.log("Local reviewer suspended successfully");
//     } catch (error) {
//       console.error("Failed to suspend local reviewer:", error);
//     }
//   };

//   const handleActivateReviewer = async (userId: string) => {
//     try {
//       await activateUser(userId).unwrap();
//       refetch();
//       console.log("Local reviewer activated successfully");
//     } catch (error) {
//       console.error("Failed to activate local reviewer:", error);
//     }
//   };

//   const handleCreateReviewer = async (data: CollaboratorRequest) => {
//     try {
//       await createCollaborator(data).unwrap();
//       setIsFormModalOpen(false);
//       refetch();
//       console.log("Local reviewer created successfully");
//     } catch (error) {
//       console.error("Failed to create local reviewer:", error);
//     }
//   };

//   const stats = [
//     {
//       title: "Tổng số Phản biện nội bộ",
//       value: localReviewers.length.toString(),
//       icon: Users,
//       variant: "info" as const
//     },
//     {
//       title: "Đang hoạt động",
//       value: localReviewers.filter(r => r.status === "active").length.toString(),
//       icon: Users,
//       variant: "success" as const
//     },
//     {
//       title: "Tạm ngưng",
//       value: localReviewers.filter(r => r.status === "inactive").length.toString(),
//       icon: Users,
//       variant: "danger" as const
//     }
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-red-600">Đã xảy ra lỗi khi tải dữ liệu</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Quản lý Phản biện nội bộ</h1>
//           <p className="text-gray-600">Quản lý tài khoản phản biện nội bộ trong hệ thống</p>
//         </div>
//         <button
//           onClick={() => setIsFormModalOpen(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           Thêm Phản biện nội bộ
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {stats.map((stat, index) => (
//           <StatCard
//             key={index}
//             title={stat.title}
//             value={stat.value}
//             icon={stat.icon}
//             variant={stat.variant}
//           />
//         ))}
//       </div>

//       {/* Search */}
//       <div className="flex items-center gap-4">
//         <div className="flex-1">
//           <SearchBar
//             value={searchTerm}
//             onChange={setSearchTerm}
//             placeholder="Tìm kiếm phản biện nội bộ..."
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <LocalReviewerTable
//           reviewers={filteredReviewers}
//           onView={handleViewReviewer}
//           onSuspend={handleSuspendReviewer}
//           onActivate={handleActivateReviewer}
//         />
//       </div>

//       {/* Local Reviewer Detail Modal */}
//       <Modal
//         isOpen={isDetailModalOpen}
//         onClose={() => setIsDetailModalOpen(false)}
//         title="Chi tiết Phản biện nội bộ"
//         size="lg"
//       >
//         {selectedReviewer && (
//           <LocalReviewerDetail
//             reviewer={selectedReviewer}
//             onClose={() => setIsDetailModalOpen(false)}
//           />
//         )}
//       </Modal>

//       {/* Local Reviewer Form Modal */}
//       <Modal
//         isOpen={isFormModalOpen}
//         onClose={() => setIsFormModalOpen(false)}
//         title="Thêm Phản biện nội bộ mới"
//         size="md"
//       >
//         <LocalReviewerForm
//           onSave={handleCreateReviewer}
//           onCancel={() => setIsFormModalOpen(false)}
//         />
//       </Modal>
//     </div>
//   );
// }