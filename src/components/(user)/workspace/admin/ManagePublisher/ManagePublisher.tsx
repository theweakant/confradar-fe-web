// "use client";

// import { useState } from "react";
// import { Plus, Building } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// import { SearchFilter } from "@/components/molecules/SearchFilter";
// import { Modal } from "@/components/molecules/Modal";
// import { PublisherDetail } from "@/components/(user)/workspace/admin/ManagePublisher/PublisherDetail";
// import { PublisherForm } from "@/components/(user)/workspace/admin/ManagePublisher/PublisherForm";
// import { PublisherTable } from "@/components/(user)/workspace/admin/ManagePublisher/PublisherTable";

// import {
//   useGetAllPublishersQuery,
//   useCreatePublisherMutation,
//   useUpdatePublisherMutation,
//   useDeletePublisherMutation,
// } from "@/redux/services/publisher.service";

// import type { Publisher, PublisherFormData } from "@/types/publisher.type";

// export default function ManagePublisher() {
//   const {
//     data: publishersResponse,
//     isLoading: publishersLoading,
//     refetch: refetchPublishers,
//   } = useGetAllPublishersQuery();

//   const [createPublisher, { isLoading: isCreating }] =
//     useCreatePublisherMutation();
//   const [updatePublisher, { isLoading: isUpdating }] =
//     useUpdatePublisherMutation();
//   const [deletePublisher, { isLoading: isDeleting }] =
//     useDeletePublisherMutation();

//   const publishers: Publisher[] = publishersResponse?.data || [];

//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");

//   const [isFormModalOpen, setIsFormModalOpen] = useState(false);
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//   const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(
//     null
//   );
//   const [viewingPublisher, setViewingPublisher] = useState<Publisher | null>(
//     null
//   );
//   const [deletePublisherId, setDeletePublisherId] = useState<string | null>(
//     null
//   );

//   const statusOptions = [{ value: "all", label: "Tất cả trạng thái" }];

//   const filteredPublishers = publishers.filter((publisher: Publisher) => {
//     const matchesSearch = publisher.name
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());
//     return matchesSearch;
//   });

//   const handleCreate = () => {
//     setEditingPublisher(null);
//     setIsFormModalOpen(true);
//   };

//   const handleView = (publisher: Publisher) => {
//     setViewingPublisher(publisher);
//     setIsDetailModalOpen(true);
//   };

//   const handleEdit = (publisher: Publisher) => {
//     setEditingPublisher(publisher);
//     setIsFormModalOpen(true);
//   };

//   const handleSave = async (data: PublisherFormData) => {
//     try {
//       if (editingPublisher) {
//         const result = await updatePublisher({
//           id: editingPublisher.publisherId,
//           data,
//         }).unwrap();
//         toast.success(result.message || "Cập nhật nhà xuất bản thành công!");
//       } else {
//         const result = await createPublisher(data).unwrap();
//         toast.success(result.message || "Thêm nhà xuất bản mới thành công!");
//       }

//       setIsFormModalOpen(false);
//       setEditingPublisher(null);
//       refetchPublishers();
//     } catch (error: unknown) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Có lỗi xảy ra, vui lòng thử lại!";
//       toast.error(message);
//     }
//   };

//   const handleDelete = (id: string) => {
//     setDeletePublisherId(id);
//   };

//   const confirmDelete = async () => {
//     if (deletePublisherId) {
//       try {
//         const result = await deletePublisher(deletePublisherId).unwrap();
//         toast.success(result.message || "Xóa nhà xuất bản thành công!");
//         setDeletePublisherId(null);
//         refetchPublishers();
//       } catch (error: unknown) {
//         const message =
//           error instanceof Error
//             ? error.message
//             : "Có lỗi xảy ra, vui lòng thử lại!";
//         toast.error(message);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <h1 className="text-3xl font-bold text-gray-900">
//               Quản lý Nhà xuất bản
//             </h1>
//             <Button
//               onClick={handleCreate}
//               className="flex items-center gap-2 whitespace-nowrap"
//               disabled={isCreating || isUpdating}
//             >
//               <Plus className="w-5 h-5" />
//               Thêm nhà xuất bản mới
//             </Button>
//           </div>
//           <p className="text-gray-600 mt-2">
//             Quản lý các nhà xuất bản bài báo
//           </p>
//         </div>

//         <SearchFilter
//           searchValue={searchQuery}
//           onSearchChange={setSearchQuery}
//           searchPlaceholder="Tìm kiếm nhà xuất bản..."
//           // filters={[
//           //   {
//           //     value: filterStatus,
//           //     onValueChange: setFilterStatus,
//           //     options: statusOptions,
//           //   },
//           // ]}
//         />

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Tổng nhà xuất bản</p>
//                 <p className="text-3xl font-bold text-gray-900">
//                   {publishersLoading ? "..." : publishers.length}
//                 </p>
//               </div>
//               <Building className="w-10 h-10 text-blue-500" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           {publishersLoading ? (
//             <div className="p-8 text-center text-gray-500">
//               Đang tải dữ liệu...
//             </div>
//           ) : (
//             <PublisherTable
//               publishers={filteredPublishers}
//               onView={handleView}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//             />
//           )}
//         </div>
//       </div>

//       <Modal
//         isOpen={isFormModalOpen}
//         onClose={() => {
//           setIsFormModalOpen(false);
//           setEditingPublisher(null);
//         }}
//         title={editingPublisher ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản mới"}
//       >
//         <PublisherForm
//           publisher={editingPublisher}
//           isLoading={isCreating || isUpdating}
//           onSave={handleSave}
//           onCancel={() => {
//             setIsFormModalOpen(false);
//             setEditingPublisher(null);
//           }}
//         />
//       </Modal>

//       <Modal
//         isOpen={isDetailModalOpen}
//         onClose={() => {
//           setIsDetailModalOpen(false);
//           setViewingPublisher(null);
//         }}
//         title="Chi tiết nhà xuất bản"
//       >
//         {viewingPublisher && (
//           <PublisherDetail
//             publisher={viewingPublisher}
//             onClose={() => {
//               setIsDetailModalOpen(false);
//               setViewingPublisher(null);
//             }}
//           />
//         )}
//       </Modal>

//       <AlertDialog
//         open={!!deletePublisherId}
//         onOpenChange={() => setDeletePublisherId(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
//             <AlertDialogDescription>
//               Bạn có chắc chắn muốn xóa nhà xuất bản này? Hành động này không thể
//               hoàn tác.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDelete}
//               className="bg-red-600 hover:bg-red-700"
//               disabled={isDeleting}
//             >
//               {isDeleting ? "Đang xóa..." : "Xóa"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }