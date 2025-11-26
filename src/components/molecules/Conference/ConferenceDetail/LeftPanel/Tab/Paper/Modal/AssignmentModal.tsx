// "use client";

// import { X, FileText } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Paper } from "@/types/paper.type";
// import { ReviewerListResponse } from "@/types/user.type";

// interface AssignmentModalProps {
//   paper: Paper | undefined;
//   selectedReviewer: string;
//   isHeadReviewer: boolean;
//   reviewersList: ReviewerListResponse[];
//   isLoadingReviewersList: boolean;
//   isAssigning: boolean;
//   onClose: () => void;
//   onAssign: () => void;
//   onReviewerChange: (value: string) => void;
//   onHeadReviewerChange: (value: boolean) => void;
// }

// const phaseStyles: Record<string, { bg: string; text: string }> = {
//   Abstract: { bg: "bg-blue-100", text: "text-blue-800" },
//   FullPaper: { bg: "bg-emerald-100", text: "text-emerald-800" },
//   Revision: { bg: "bg-amber-100", text: "text-amber-800" },
//   CameraReady: { bg: "bg-purple-100", text: "text-purple-800" },
//   default: { bg: "bg-gray-100", text: "text-gray-800" },
// };

// export function AssignmentModal({
//   paper,
//   selectedReviewer,
//   isHeadReviewer,
//   reviewersList,
//   isLoadingReviewersList,
//   isAssigning,
//   onClose,
//   onAssign,
//   onReviewerChange,
//   onHeadReviewerChange,
// }: AssignmentModalProps) {
//   // Kiểm tra xem có phải giai đoạn Abstract không
//   const isAbstractPhase = paper?.paperPhase === "Abstract";

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-gray-900">
//             {isAbstractPhase ? "Giao reviewer cho bài báo" : "Chi tiết bài báo"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Thông tin bài báo */}
//           {paper && (
//             <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//               <div className="flex items-start gap-3">
//                 <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <FileText className="w-5 h-5 text-blue-600" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-semibold text-gray-900 mb-1">{paper.title}</h3>
//                   <div className="flex items-center gap-2 text-xs text-gray-500">
//                     <span>#{paper.paperId}</span>
//                     <span>•</span>
//                     <span
//                       className={`px-2 py-0.5 rounded-full ${
//                         phaseStyles[paper.paperPhase]?.bg || phaseStyles.default.bg
//                       } ${phaseStyles[paper.paperPhase]?.text || phaseStyles.default.text}`}
//                     >
//                       {paper.paperPhase}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {!isAbstractPhase && (
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0">
//                   <svg
//                     className="w-5 h-5 text-amber-600"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-semibold text-amber-900 mb-1">
//                     Không thể giao reviewer
//                   </h4>
//                   <p className="text-sm text-amber-700">
//                     Chỉ có thể giao reviewer cho bài báo ở giai đoạn <strong>Abstract</strong>.
//                     Bài báo này đang ở giai đoạn <strong>{paper?.paperPhase}</strong>.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {isAbstractPhase && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Chọn Reviewer
//                 </label>
//                 <select
//                   value={selectedReviewer}
//                   onChange={(e) => onReviewerChange(e.target.value)}
//                   disabled={isLoadingReviewersList}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">-- Chọn reviewer --</option>
//                   {isLoadingReviewersList ? (
//                     <option disabled>Đang tải...</option>
//                   ) : reviewersList.length === 0 ? (
//                     <option disabled>Không có reviewer nào</option>
//                   ) : (
//                     reviewersList.map((rev) => (
//                       <option key={rev.userId} value={rev.userId}>
//                         {rev.fullName || rev.email || rev.userId}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                 <input
//                   type="checkbox"
//                   checked={isHeadReviewer}
//                   onChange={(e) => onHeadReviewerChange(e.target.checked)}
//                   id="isHeadReviewer"
//                   className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                 />
//                 <label htmlFor="isHeadReviewer" className="text-sm font-medium text-gray-700">
//                   Giao làm Head Reviewer
//                 </label>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Footer buttons */}
//         <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
//           <Button
//             onClick={onClose}
//             variant="outline"
//             className="border border-gray-300 hover:bg-gray-100"
//           >
//             {isAbstractPhase ? "Hủy" : "Đóng"}
//           </Button>
          
//           {isAbstractPhase && (
//             <Button
//               onClick={onAssign}
//               disabled={isAssigning || isLoadingReviewersList || !selectedReviewer}
//               className="bg-blue-600 hover:bg-blue-700 text-white"
//             >
//               {isAssigning ? "Đang xử lý..." : "Giao reviewer"}
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { X, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Paper } from "@/types/paper.type";
import { ReviewerListResponse } from "@/types/user.type";
import { Abstract1 } from "@/types/paper.type";

interface AssignmentModalProps {
  paper: Paper | undefined;
  selectedReviewer: string;
  isHeadReviewer: boolean;
  reviewersList: ReviewerListResponse[];
  isLoadingReviewersList: boolean;
  isAssigning: boolean;
  pendingAbstracts: Abstract1[];
  isDeciding: boolean;
  onClose: () => void;
  onAssign: () => void;
  onReviewerChange: (value: string) => void;
  onHeadReviewerChange: (value: boolean) => void;
  onDecisionStart: (abstract: Abstract1) => void;
}

const phaseStyles: Record<string, { bg: string; text: string }> = {
  Abstract: { bg: "bg-blue-100", text: "text-blue-800" },
  FullPaper: { bg: "bg-emerald-100", text: "text-emerald-800" },
  Revision: { bg: "bg-amber-100", text: "text-amber-800" },
  CameraReady: { bg: "bg-purple-100", text: "text-purple-800" },
  default: { bg: "bg-gray-100", text: "text-gray-800" },
};

export function AssignmentModal({
  paper,
  selectedReviewer,
  isHeadReviewer,
  reviewersList,
  isLoadingReviewersList,
  isAssigning,
  pendingAbstracts,
  isDeciding,
  onClose,
  onAssign,
  onReviewerChange,
  onHeadReviewerChange,
  onDecisionStart,
}: AssignmentModalProps) {
  const isAbstractPhase = paper?.paperPhase === "Abstract";
  const pendingAbstract = isAbstractPhase
    ? pendingAbstracts.find(abs => abs.paperId === paper.paperId) || null
    : null;

  const hasReviewers = paper?.assignedReviewers && paper.assignedReviewers.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isAbstractPhase ? "Giao reviewer cho bài báo" : "Chi tiết bài báo"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Paper Info */}
          {paper && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{paper.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>#{paper.paperId}</span>
                    <span>•</span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        phaseStyles[paper.paperPhase]?.bg || phaseStyles.default.bg
                      } ${phaseStyles[paper.paperPhase]?.text || phaseStyles.default.text}`}
                    >
                      {paper.paperPhase}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isAbstractPhase && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">
                    Không thể giao reviewer
                  </h4>
                  <p className="text-sm text-amber-700">
                    Chỉ có thể giao reviewer cho bài báo ở giai đoạn <strong>Abstract</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAbstractPhase && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Reviewer
                </label>
                <select
                  value={selectedReviewer}
                  onChange={(e) => onReviewerChange(e.target.value)}
                  disabled={isLoadingReviewersList}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn reviewer --</option>
                  {isLoadingReviewersList ? (
                    <option disabled>Đang tải...</option>
                  ) : reviewersList.length === 0 ? (
                    <option disabled>Không có reviewer nào</option>
                  ) : (
                    reviewersList.map((rev) => (
                      <option key={rev.userId} value={rev.userId}>
                        {rev.fullName || rev.email || rev.userId}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  checked={isHeadReviewer}
                  onChange={(e) => onHeadReviewerChange(e.target.checked)}
                  id="isHeadReviewer"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isHeadReviewer" className="text-sm font-medium text-gray-700">
                  Giao làm Head Reviewer
                </label>
              </div>
            </>
          )}

          {/* Duyệt Abstract Button */}
          {pendingAbstract && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Abstract này đang chờ quyết định
                </span>
              </div>
              <Button
                onClick={() => onDecisionStart(pendingAbstract)}
                disabled={isDeciding}
                className="w-full py-2.5"
                variant="outline"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Duyệt abstract
              </Button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="border border-gray-300 hover:bg-gray-100"
          >
            {isAbstractPhase ? "Hủy" : "Đóng"}
          </Button>

          {isAbstractPhase && (
            <Button
              onClick={onAssign}
              disabled={isAssigning || isLoadingReviewersList || !selectedReviewer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAssigning ? "Đang xử lý..." : "Giao reviewer"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}