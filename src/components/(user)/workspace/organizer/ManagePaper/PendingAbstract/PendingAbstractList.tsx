// "use client";
// import { useParams } from "next/navigation"; 
// import { FileText, Calendar, User, Tag } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
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
// import {
//   useListPendingAbstractsQuery,
//   useDecideAbstractStatusMutation,
// } from "@/redux/services/paper.service";
// import { toast } from "sonner";
// import { useState } from "react";
// import { ApiError } from "@/types/api.type";

// interface Abstract {
//   abstractId: string;
//   paperId: string;
//   presenterName: string;
//   conferenceName: string;
//   globalStatusName: string;
//   createdAt: string;
//   abstractUrl: string;
// }

// type DecisionType = "Accepted" | "Rejected";

// export default function PendingAbstractList() {
//   const { confId } = useParams();
//   const { data: response, isLoading, isError } = useListPendingAbstractsQuery(confId as string);
//   const [decideAbstractStatus, { isLoading: isDeciding }] =
//     useDecideAbstractStatusMutation();

//   const pendingAbstracts = response?.data || [];

//   const [selectedAbstract, setSelectedAbstract] = useState<Abstract | null>(null);
//   const [showDecisionDialog, setShowDecisionDialog] = useState(false);
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//   const [pendingDecision, setPendingDecision] = useState<DecisionType | null>(null);

//   const handleOpenDecisionDialog = (abstract:unknown) => {
//     setSelectedAbstract(abstract as Abstract);
//     setShowDecisionDialog(true);
//   };

//   const handleDecisionClick = (decision:unknown) => {
//     setPendingDecision(decision as DecisionType);
//     setShowDecisionDialog(false);
//     setShowConfirmDialog(true);
//   };

//   const handleConfirmDecision = async () => {
//     if (!selectedAbstract || !pendingDecision) return;

//     try {
//       await decideAbstractStatus({
//         paperId: selectedAbstract.paperId,
//         abstractId: selectedAbstract.abstractId,
//         globalStatus: pendingDecision,
//       }).unwrap();

//       toast.success(
//         pendingDecision === "Accepted"
//           ? "Đã chấp nhận bài báo thành công!"
//           : "Đã từ chối bài báo thành công!"
//       );
      
//       setShowConfirmDialog(false);
//       setSelectedAbstract(null);
//       setPendingDecision(null);
//     } catch (error) {
//     const apiError = error as { data?: ApiError };
//     const message = apiError.data?.message || "Có lỗi xảy ra khi xử lý bài báo";
//     toast.error(message);
//     console.error("Error processing abstract:", error);
//     setShowConfirmDialog(false);
//   }
//   };

//   const handleCancelConfirm = () => {
//     setShowConfirmDialog(false);
//     setShowDecisionDialog(true);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900">
//               Danh sách bài báo đang chờ
//             </h1>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//             <p className="text-gray-600">Đang tải...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900">
//               Danh sách bài báo đang chờ
//             </h1>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//             <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Danh sách abstract chờ duyệt
//           </h1>
//         </div>

//         <div className="grid gap-6">
//           {pendingAbstracts.map((abstract) => (
//             <div
//               key={abstract.abstractId}
//               className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <h3 className="text-xl font-semibold text-gray-900 mb-3">
//                     abstractId: {abstract.abstractId.substring(0, 8)}...
//                   </h3>

//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div className="flex items-center text-sm text-gray-600">
//                       <User className="w-4 h-4 mr-2" />
//                       <span>Diễn giả: {abstract.presenterName}</span>
//                     </div>

//                     <div className="flex items-center text-sm text-gray-600">
//                       <FileText className="w-4 h-4 mr-2" />
//                       <span>{abstract.conferenceName}</span>
//                     </div>

//                     <div className="flex items-center text-sm text-gray-600">
//                       <Tag className="w-4 h-4 mr-2" />
//                       <span>Trạng thái: {abstract.globalStatusName}</span>
//                     </div>

//                     <div className="flex items-center text-sm text-gray-600">
//                       <Calendar className="w-4 h-4 mr-2" />
//                       <span>
//                         Ngày nộp:{" "}
//                         {new Date(abstract.createdAt).toLocaleDateString(
//                           "vi-VN",
//                         )}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
//                       {abstract.globalStatusName}
//                     </span>
//                     <a
//                       href={abstract.abstractUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-xs text-blue-600 hover:underline"
//                     >
//                       Xem file
//                     </a>
//                   </div>
//                 </div>

//                 <Button
//                   className="ml-4"
//                   onClick={() => handleOpenDecisionDialog(abstract)}
//                   disabled={isDeciding}
//                 >
//                   Quyết định
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {pendingAbstracts.length === 0 && (
//           <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//             <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               Không có bài báo nào
//             </h3>
//             <p className="text-gray-600">
//               Hiện tại bạn chưa được phân công đánh giá bài báo nào
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Decision Dialog */}
//       <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Quyết định bài báo</DialogTitle>
//             <DialogDescription>
//               Vui lòng chọn quyết định cho bài báo này
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter className="flex gap-2 sm:gap-2">
//             <Button
//               variant="default"
//               className="bg-green-600 hover:bg-green-700"
//               onClick={() => handleDecisionClick("Accepted")}
//             >
//               Chấp nhận
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => handleDecisionClick("Rejected")}
//             >
//               Từ chối
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Confirm Dialog */}
//       <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Xác nhận quyết định</AlertDialogTitle>
//             <AlertDialogDescription>
//               Thao tác này sẽ không thể hoàn tác. Bạn có chắc chắn muốn{" "}
//               {pendingDecision === "Accepted" ? "chấp nhận" : "từ chối"} bài báo này?
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel onClick={handleCancelConfirm}>
//               Hủy
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleConfirmDecision}
//               disabled={isDeciding}
//               className={
//                 pendingDecision === "Accepted"
//                   ? "bg-green-600 hover:bg-green-700"
//                   : "bg-red-600 hover:bg-red-700"
//               }
//             >
//               {isDeciding ? "Đang xử lý..." : "Xác nhận"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }