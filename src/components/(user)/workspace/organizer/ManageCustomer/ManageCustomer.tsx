// "use client";

// import { useState, useEffect } from "react";
// import { Search, Plus, Users } from "lucide-react";
// import { Modal } from "@/components/molecules/Modal";
// import { SearchBar } from "@/components/molecules/SearchBar";
// import { StatCard } from "@/components/molecules/StatCard";
// import { CustomerTable } from "./CustomerTable";
// import { CustomerDetail } from "./CustomerDetail";
// import { CustomerForm } from "./CustomerForm";
// import {
//   useGetAllUsersQuery,
//   useSuspendUserMutation,
//   useActivateUserMutation,
//   useCreateCollaboratorMutation
// } from "@/redux/services/user.service";
// import { UserProfileResponse } from "@/types/user.type";
// import { CollaboratorRequest } from "@/types/user.type";

// export default function ManageCustomer() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState<UserProfileResponse | null>(null);
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

//   // Filter users to only show customers
//   const customers = allUsers.filter(
//     user => user.role === "customer"
//   );

//   // Search functionality
//   const filteredCustomers = customers.filter(customer =>
//     customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     customer.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleViewCustomer = (customer: UserProfileResponse) => {
//     setSelectedCustomer(customer);
//     setIsDetailModalOpen(true);
//   };

//   const handleSuspendCustomer = async (userId: string) => {
//     try {
//       await suspendUser(userId).unwrap();
//       refetch();
//       console.log("Customer suspended successfully");
//     } catch (error) {
//       console.error("Failed to suspend customer:", error);
//     }
//   };

//   const handleActivateCustomer = async (userId: string) => {
//     try {
//       await activateUser(userId).unwrap();
//       refetch();
//       console.log("Customer activated successfully");
//     } catch (error) {
//       console.error("Failed to activate customer:", error);
//     }
//   };

//   const handleCreateCustomer = async (data: CollaboratorRequest) => {
//     try {
//       await createCollaborator(data).unwrap();
//       setIsFormModalOpen(false);
//       refetch();
//       console.log("Customer created successfully");
//     } catch (error) {
//       console.error("Failed to create customer:", error);
//     }
//   };

//   const stats = [
//     {
//       title: "Tổng số Khách hàng",
//       value: customers.length.toString(),
//       icon: Users,
//       variant: "info" as const
//     },
//     {
//       title: "Đang hoạt động",
//       value: customers.filter(c => c.status === "active").length.toString(),
//       icon: Users,
//       variant: "success" as const
//     },
//     {
//       title: "Tạm ngưng",
//       value: customers.filter(c => c.status === "inactive").length.toString(),
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
//           <h1 className="text-2xl font-bold text-gray-900">Quản lý Khách hàng</h1>
//           <p className="text-gray-600">Quản lý tài khoản khách hàng trong hệ thống</p>
//         </div>
//         <button
//           onClick={() => setIsFormModalOpen(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           Thêm Khách hàng
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
//             placeholder="Tìm kiếm khách hàng..."
//             className="w-full"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <CustomerTable
//           customers={filteredCustomers}
//           onView={handleViewCustomer}
//           onSuspend={handleSuspendCustomer}
//           onActivate={handleActivateCustomer}
//         />
//       </div>

//       {/* Customer Detail Modal */}
//       <Modal
//         isOpen={isDetailModalOpen}
//         onClose={() => setIsDetailModalOpen(false)}
//         title="Chi tiết Khách hàng"
//         size="lg"
//       >
//         {selectedCustomer && (
//           <CustomerDetail
//             customer={selectedCustomer}
//             onClose={() => setIsDetailModalOpen(false)}
//           />
//         )}
//       </Modal>

//       {/* Customer Form Modal */}
//       <Modal
//         isOpen={isFormModalOpen}
//         onClose={() => setIsFormModalOpen(false)}
//         title="Thêm Khách hàng mới"
//         size="md"
//       >
//         <CustomerForm
//           onSave={handleCreateCustomer}
//           onCancel={() => setIsFormModalOpen(false)}
//         />
//       </Modal>
//     </div>
//   );
// }