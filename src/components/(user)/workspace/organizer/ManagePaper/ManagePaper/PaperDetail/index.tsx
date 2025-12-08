// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { ApiError } from "@/types/api.type";
// import { useAssignPaperToReviewerMutation } from "@/redux/services/paper.service";
// import { useGetReviewersListQuery } from "@/redux/services/user.service";
// import { ReviewerListResponse } from "@/types/user.type";

// interface PaperDetailProps {
//   paperId: string;
//   onClose: () => void;
// }

// export function PaperDetail({ paperId, onClose }: PaperDetailProps) {
//   const [selectedReviewers, setSelectedReviewers] = useState<
//     { userId: string; isHeadReviewer: boolean }[]
//   >([]);

//   const { data: reviewersData, isLoading: isLoadingReviewers } = useGetReviewersListQuery();
//   const reviewers = reviewersData?.data ?? [];

//   const [assignPaper, { isLoading }] = useAssignPaperToReviewerMutation();

//   // Tự động gán người đầu tiên làm Head nếu chưa có
//   useEffect(() => {
//     if (
//       selectedReviewers.length > 0 &&
//       !selectedReviewers.some((r) => r.isHeadReviewer)
//     ) {
//       const updated = selectedReviewers.map((r, idx) =>
//         idx === 0 ? { ...r, isHeadReviewer: true } : r
//       );
//       setSelectedReviewers(updated);
//     }
//   }, [selectedReviewers]);

//   const toggleReviewer = (userId: string, checked: boolean) => {
//     if (checked) {
//       const newReviewer = { userId, isHeadReviewer: false };
//       setSelectedReviewers((prev) => [...prev, newReviewer]);
//     } else {
//       setSelectedReviewers((prev) => prev.filter((r) => r.userId !== userId));
//     }
//   };

//   const setHeadReviewer = (userId: string) => {
//     setSelectedReviewers((prev) =>
//       prev.map((r) => ({
//         ...r,
//         isHeadReviewer: r.userId === userId,
//       }))
//     );
//   };

//   const handleAssign = async () => {
//     if (selectedReviewers.length === 0) {
//       toast.error("Vui lòng chọn ít nhất 1 reviewer!");
//       return;
//     }

//     try {
//       const res = await assignPaper({
//         paperId,
//         reviewers: selectedReviewers,
//       }).unwrap();

//       toast.success(res.message || "Giao reviewer thành công!");
//       onClose();
//     } catch (error: unknown) {
//       const err = error as { data?: ApiError };
//       const errorMessage = err?.data?.message || "Gán reviewer thất bại!";
//       toast.error(errorMessage);
//     }
//   };

//   const selectedIds = new Set(selectedReviewers.map((r) => r.userId));
//   const selectedReviewerObjects = reviewers.filter((rev) => selectedIds.has(rev.userId));
//   const currentHead = selectedReviewers.find((r) => r.isHeadReviewer)?.userId;

//   return (
//     <div className="space-y-6 p-6">
//       <h2 className="text-xl font-semibold text-gray-900">
//         Giao reviewer cho bài báo
//       </h2>

//       <div className="space-y-4">
//         {/* Danh sách reviewer */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Chọn Reviewer
//           </label>
//           {isLoadingReviewers ? (
//             <div className="text-sm text-gray-500">Đang tải...</div>
//           ) : reviewers.length === 0 ? (
//             <div className="text-sm text-gray-500">Không có reviewer nào</div>
//           ) : (
//             <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
//               {reviewers.map((rev) => (
//                 <div key={rev.userId} className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     id={`rev-${rev.userId}`}
//                     checked={selectedIds.has(rev.userId)}
//                     onChange={(e) => toggleReviewer(rev.userId, e.target.checked)}
//                     className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor={`rev-${rev.userId}`} className="text-sm flex-1">
//                     {rev.fullName || rev.email || rev.userId}
//                   </label>
//                   {selectedIds.has(rev.userId) && selectedReviewers.find(r => r.userId === rev.userId)?.isHeadReviewer && (
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
//                       Head
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Chọn Head Reviewer */}
//         {selectedReviewerObjects.length > 0 && (
//           <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Chọn Head Reviewer
//             </label>
//             <select
//               value={currentHead || ""}
//               onChange={(e) => setHeadReviewer(e.target.value)}
//               className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-blue-200"
//             >
//               {selectedReviewerObjects.map((rev) => (
//                 <option key={rev.userId} value={rev.userId}>
//                   {rev.fullName || rev.email || rev.userId}
//                 </option>
//               ))}
//             </select>
//             <p className="text-xs text-gray-500 mt-1">
//               Chỉ một reviewer có thể là Head Reviewer.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Footer buttons */}
//       <div className="flex justify-end gap-3 pt-4 border-t">
//         <Button
//           onClick={onClose}
//           variant="outline"
//           className="border border-gray-300 hover:bg-gray-50"
//         >
//           Đóng
//         </Button>
//         <Button
//           onClick={handleAssign}
//           disabled={isLoading || selectedReviewers.length === 0}
//           className="bg-blue-600 hover:bg-blue-700 text-white"
//         >
//           {isLoading ? "Đang xử lý..." : `Gán (${selectedReviewers.length})`}
//         </Button>
//       </div>
//     </div>
//   );
// }