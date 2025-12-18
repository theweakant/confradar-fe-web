// src/components/molecules/Calendar/SessionCalendar/Modal/PresenterSessionDetail.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, User, CheckCircle } from "lucide-react";
import { useAssignPresenterToSessionMutation } from "@/redux/services/paper.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api.type";

interface PresentSessionData {
  sessionId: string;
  title: string;
  onDate: string;
  presenters: Array<{
    presenterName: string;
    paperTitle: string;
  }>;
}

interface PresenterSessionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  session: PresentSessionData | null;
  onRefetch?: () => void;
  selectedPaperId?: string | null;
  conferenceId?: string;
}

const PresenterSessionDetailDialog: React.FC<PresenterSessionDetailDialogProps> = ({
  open,
  onClose,
  session,
  onRefetch,
  selectedPaperId,
  conferenceId,
}) => {
  const [assignPresenter, { isLoading: isAssigning }] = useAssignPresenterToSessionMutation();

  if (!session) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return dateString;
    }
  };

  const handleAssignPresenter = async () => {
    if (!selectedPaperId) {
      toast.error("Vui lòng chọn một bài báo trước.");
      return;
    }

    // Show confirmation toast
    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Xác nhận gán presenter</h3>
            <p className="text-sm text-gray-600 mb-3">
              Bạn có chắc muốn gán bài báo này vào session{" "}
              <span className="font-semibold text-gray-900">&quot;{session.title}&quot;</span>?
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(session.onDate).toLocaleDateString('vi-VN')}</span>
              <span className="mx-1">•</span>
              <span>{session.presenters.length} presenter đã gán</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => toast.dismiss(t)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await assignPresenter({
                    paperId: selectedPaperId,
                    sessionId: session.sessionId,
                  }).unwrap();

                  toast.success("Đã gán presenter vào session thành công!");
                  onRefetch?.();
                  onClose();
                } catch (err) {
                  console.error("Gán presenter thất bại:", err);
                  const apiError = (err as { data?: ApiError })?.data;
                  toast.error(apiError?.message || "Không thể gán presenter. Vui lòng thử lại.");
                }
              }}
              disabled={isAssigning}
            >
              {isAssigning ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const hasSelectedPaper = !!selectedPaperId;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chi tiết session trình bày
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Session Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
          </div>

          {/* Session Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Date */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mt-0.5">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Ngày diễn ra</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(session.onDate)}
                </p>
              </div>
            </div>

            {/* Presenter Count */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mt-0.5">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Số lượng presenter</p>
                <p className="text-sm font-medium text-gray-900">
                  {session.presenters.length} người
                </p>
              </div>
            </div>
          </div>

          {/* Selected Paper Notice */}
          {hasSelectedPaper && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-sm text-green-800 leading-relaxed">
                Đã chọn bài báo. Click nút <strong>&quot;Gán presenter&quot;</strong> bên dưới để gán vào session này.
              </p>
            </div>
          )}

          {/* Presenters List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">
                Danh sách presenter ({session.presenters.length})
              </h4>
            </div>

            {session.presenters.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chưa có presenter nào được gán</p>
                <p className="text-xs text-gray-400 mt-1">
                  Vui lòng chọn bài báo từ danh sách để gán vào session này
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {session.presenters.map((presenter, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {presenter.presenterName}
                      </p>
                      <div className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {presenter.paperTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Notice */}
          {!hasSelectedPaper && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Để gán presenter, vui lòng chọn bài báo từ danh sách bên phải trước.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </Button>
          
          {hasSelectedPaper && (
            <Button
              onClick={handleAssignPresenter}
              disabled={isAssigning}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isAssigning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gán...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Gán presenter
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PresenterSessionDetailDialog;


// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Calendar,
//   Users,
//   FileText,
//   User,
//   CheckCircle,
//   Eye,
//   Download,
//   X,
//   ChevronRight,
//   ArrowLeft,
// } from "lucide-react";
// import { useAssignPresenterToSessionMutation } from "@/redux/services/paper.service";
// import { toast } from "sonner";
// import { ApiError } from "@/types/api.type";
// import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

// interface PresentSessionData {
//   sessionId: string;
//   title: string;
//   onDate: string;
//   presenters: Array<{
//     presenterName: string;
//     paperTitle: string;
//     paperId?: string;
//   }>;
// }

// interface PresenterSessionDetailDialogProps {
//   open: boolean;
//   onClose: () => void;
//   session: PresentSessionData | null;
//   onRefetch?: () => void;
//   selectedPaperId?: string | null;
//   conferenceId?: string;
// }

// // 🔹 Types for Paper Detail
// interface Author {
//   userId: string;
//   fullName: string;
//   avatarUrl: string | null;
// }

// interface DocumentBase {
//   fileUrl: string;
//   status: string | null;
//   title: string;
//   description: string;
//   reason: string | null;
//   created: string | null;
//   updated: string | null;
// }

// interface AbstractDoc extends DocumentBase {
//   abstractId: string;
// }

// interface FullPaperDoc extends DocumentBase {
//   fullPaperId: string;
// }

// interface RevisionPaperDoc extends DocumentBase {
//   revisionPaperId: string;
// }

// interface CameraReadyDoc extends DocumentBase {
//   cameraReadyId: string;
//   rootPaperId: string | null;
// }

// interface PaperData {
//   paperId: string;
//   title: string;
//   description: string;
//   researchConferenceInfo: any;
//   created: string | null;
//   rootAuthor: Author;
//   coAuthors: Author[];
//   ticketId: string | null;
//   currentPhase: string | null;
//   abstract: AbstractDoc | null;
//   fullPaper: FullPaperDoc | null;
//   revisionPaper: RevisionPaperDoc | null;
//   cameraReady: CameraReadyDoc | null;
//   researchPhase: string | null;
//   revisionDeadline: string | null;
// }

// // 🔹 Paper Detail View Component (embedded)
// const PaperDetailViewContent: React.FC<{
//   paper: PaperData;
//   onViewDocument: (fileUrl: string, fileName: string) => void;
// }> = ({ paper, onViewDocument }) => {
//   const formatDateTime = (dateString: string | null) => {
//     if (!dateString) return "Chưa cập nhật";
//     try {
//       return new Date(dateString).toLocaleDateString("vi-VN", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   const getStatusBadge = (status: string | null) => {
//     if (!status) return null;

//     const statusColors: Record<string, string> = {
//       approved: "bg-green-100 text-green-700 border-green-200",
//       rejected: "bg-red-100 text-red-700 border-red-200",
//       pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
//       revision: "bg-orange-100 text-orange-700 border-orange-200",
//     };

//     const statusLabels: Record<string, string> = {
//       approved: "Đã duyệt",
//       rejected: "Từ chối",
//       pending: "Chờ duyệt",
//       revision: "Cần chỉnh sửa",
//     };

//     return (
//       <span
//         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
//           statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200"
//         }`}
//       >
//         {statusLabels[status.toLowerCase()] || status}
//       </span>
//     );
//   };

//   const DocumentCard = ({
//     title,
//     type,
//     doc,
//   }: {
//     title: string;
//     type: string;
//     doc: DocumentBase | null;
//   }) => {
//     if (!doc) return null;

//     // Clean URL (remove trailing spaces from your sample data)
//     const cleanUrl = doc.fileUrl?.trim();

//     if (!cleanUrl) return null;

//     return (
//       <div className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
//         <div className="flex items-start justify-between mb-2">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
//               <FileText className="w-3.5 h-3.5 text-blue-600" />
//             </div>
//             <div>
//               <h4 className="text-xs font-semibold text-gray-900">{title}</h4>
//               <p className="text-[10px] text-gray-500">{type}</p>
//             </div>
//           </div>
//           {doc.status && getStatusBadge(doc.status)}
//         </div>

//         <div className="space-y-1.5 mb-2">
//           <div>
//             <p className="text-[10px] font-medium text-gray-500">Tiêu đề</p>
//             <p className="text-xs text-gray-900 line-clamp-1">{doc.title}</p>
//           </div>
//           <div>
//             <p className="text-[10px] font-medium text-gray-500">Mô tả</p>
//             <p className="text-xs text-gray-600 line-clamp-2">{doc.description}</p>
//           </div>
//           {doc.created && (
//             <div>
//               <p className="text-[10px] font-medium text-gray-500">Ngày tạo</p>
//               <p className="text-xs text-gray-600">{formatDateTime(doc.created)}</p>
//             </div>
//           )}
//           {doc.reason && (
//             <div className="p-1.5 bg-yellow-50 border border-yellow-200 rounded">
//               <p className="text-[10px] font-medium text-yellow-800">Lý do: {doc.reason}</p>
//             </div>
//           )}
//         </div>

//         <div className="flex gap-1.5">
//           <button
//             onClick={() => onViewDocument(cleanUrl, doc.title)}
//             className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
//           >
//             <Eye className="w-3 h-3" />
//             Xem
//           </button>
//           <a
//             href={cleanUrl}
//             download
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center justify-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
//           >
//             <Download className="w-3 h-3" />
//           </a>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {/* Header Section */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <h2 className="text-lg font-bold mb-1">{paper.title}</h2>
//             <p className="text-blue-100 text-xs leading-relaxed line-clamp-2">{paper.description}</p>
//           </div>
//           {paper.currentPhase && (
//             <span className="ml-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium whitespace-nowrap">
//               {paper.currentPhase}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Left Column - Authors & Info */}
//         <div className="lg:col-span-1 space-y-3">
//           {/* Root Author */}
//           <div className="bg-white border border-gray-200 rounded-lg p-3">
//             <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
//               <User className="w-3.5 h-3.5 text-blue-600" />
//               Tác giả chính
//             </h3>
//             <div className="flex items-center gap-2">
//               {paper.rootAuthor.avatarUrl ? (
//                 <img
//                   src={paper.rootAuthor.avatarUrl}
//                   alt={paper.rootAuthor.fullName}
//                   className="w-8 h-8 rounded-full object-cover"
//                 />
//               ) : (
//                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
//                   {paper.rootAuthor.fullName.charAt(0).toUpperCase()}
//                 </div>
//               )}
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-gray-900 truncate">{paper.rootAuthor.fullName}</p>
//                 <p className="text-[10px] text-gray-500 truncate">{paper.rootAuthor.userId}</p>
//               </div>
//             </div>
//           </div>

//           {/* Co-Authors */}
//           {paper.coAuthors && paper.coAuthors.length > 0 && (
//             <div className="bg-white border border-gray-200 rounded-lg p-3">
//               <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
//                 <Users className="w-3.5 h-3.5 text-blue-600" />
//                 Đồng tác giả ({paper.coAuthors.length})
//               </h3>
//               <div className="space-y-1.5">
//                 {paper.coAuthors.map((author, idx) => (
//                   <div key={author.userId || idx} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-md">
//                     {author.avatarUrl ? (
//                       <img
//                         src={author.avatarUrl}
//                         alt={author.fullName}
//                         className="w-6 h-6 rounded-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-semibold">
//                         {author.fullName.charAt(0).toUpperCase()}
//                       </div>
//                     )}
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-medium text-gray-900 truncate">{author.fullName}</p>
//                       <p className="text-[10px] text-gray-500 truncate">{author.userId}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Additional Info */}
//           <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
//             <h3 className="text-xs font-semibold text-gray-900 mb-2">Thông tin bổ sung</h3>

//             {paper.created ? (
//               <div>
//                 <p className="text-[10px] font-medium text-gray-500 mb-0.5">Ngày tạo</p>
//                 <div className="flex items-center gap-1.5 text-xs text-gray-900">
//                   <Calendar className="w-3 h-3 text-gray-400" />
//                   <span className="text-[11px]">{formatDateTime(paper.created)}</span>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <p className="text-[10px] font-medium text-gray-500 mb-0.5">Ngày tạo</p>
//                 <p className="text-[11px] text-gray-500">Chưa cập nhật</p>
//               </div>
//             )}

//             {paper.revisionDeadline && (
//               <div>
//                 <p className="text-[10px] font-medium text-gray-500 mb-0.5">Hạn chỉnh sửa</p>
//                 <div className="flex items-center gap-1.5 text-xs text-red-600">
//                   <Calendar className="w-3 h-3" />
//                   <span className="text-[11px]">{formatDateTime(paper.revisionDeadline)}</span>
//                 </div>
//               </div>
//             )}

//             {paper.ticketId && (
//               <div>
//                 <p className="text-[10px] font-medium text-gray-500 mb-0.5">Ticket ID</p>
//                 <p className="text-[11px] text-gray-900 font-mono break-all">{paper.ticketId}</p>
//               </div>
//             )}

//             {paper.researchPhase && (
//               <div>
//                 <p className="text-[10px] font-medium text-gray-500 mb-0.5">Giai đoạn</p>
//                 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200">
//                   {paper.researchPhase}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Column - Documents */}
//         <div className="lg:col-span-2 space-y-3">
//           <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
//             <FileText className="w-4 h-4 text-blue-600" />
//             Tài liệu nghiên cứu
//           </h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <DocumentCard title="Abstract" type="Bản tóm tắt" doc={paper.abstract} />
//             <DocumentCard title="Full Paper" type="Bài báo đầy đủ" doc={paper.fullPaper} />
//             <DocumentCard title="Revision Paper" type="Bản chỉnh sửa" doc={paper.revisionPaper} />
//             <DocumentCard title="Camera Ready" type="Bản hoàn chỉnh" doc={paper.cameraReady} />
//           </div>

//           {!paper.abstract &&
//             !paper.fullPaper &&
//             !paper.revisionPaper &&
//             !paper.cameraReady && (
//               <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                 <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
//                 <p className="text-xs font-medium text-gray-600">Chưa có tài liệu nào</p>
//                 <p className="text-[10px] text-gray-500 mt-1">Các tài liệu sẽ được hiển thị ở đây khi có</p>
//               </div>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // 🔹 Main Dialog Component
// const PresenterSessionDetailDialog: React.FC<PresenterSessionDetailDialogProps> = ({
//   open,
//   onClose,
//   session,
//   onRefetch,
//   selectedPaperId,
//   conferenceId,
// }) => {
//   const [assignPresenter, { isLoading: isAssigning }] = useAssignPresenterToSessionMutation();
//   const [viewPaperDetail, setViewPaperDetail] = useState(false);
//   const [selectedPaperData, setSelectedPaperData] = useState<PaperData | null>(null);
//   const [loadingPaper, setLoadingPaper] = useState(false);
//   const [viewerOpen, setViewerOpen] = useState(false);
//   const [currentDoc, setCurrentDoc] = useState<{ uri: string; fileName: string } | null>(null);

//   if (!session) return null;

//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("vi-VN", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         weekday: "long",
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   const handleAssignPresenter = async () => {
//     if (!selectedPaperId) {
//       toast.error("Vui lòng chọn một bài báo trước.");
//       return;
//     }

//     toast.custom(
//       (t) => (
//         <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-lg max-w-md">
//           <div className="mb-4">
//             <h3 className="font-semibold text-gray-900 mb-2">Xác nhận gán presenter</h3>
//             <p className="text-sm text-gray-600 mb-3">
//               Bạn có chắc muốn gán bài báo này vào session{" "}
//               <span className="font-semibold text-gray-900">&quot;{session.title}&quot;</span>?
//             </p>
//             <div className="flex items-center gap-2 text-xs text-gray-500">
//               <Calendar className="w-4 h-4" />
//               <span>{formatDate(session.onDate)}</span>
//               <span className="mx-1">•</span>
//               <span>{session.presenters.length} presenter đã gán</span>
//             </div>
//           </div>
//           <div className="flex justify-end gap-2">
//             <button
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//               onClick={() => toast.dismiss(t)}
//             >
//               Hủy
//             </button>
//             <button
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               onClick={async () => {
//                 toast.dismiss(t);
//                 try {
//                   await assignPresenter({
//                     paperId: selectedPaperId,
//                     sessionId: session.sessionId,
//                   }).unwrap();

//                   toast.success("Đã gán presenter vào session thành công!");
//                   onRefetch?.();
//                   onClose();
//                 } catch (err) {
//                   console.error("Gán presenter thất bại:", err);
//                   const apiError = (err as { data?: ApiError })?.data;
//                   toast.error(apiError?.message || "Không thể gán presenter. Vui lòng thử lại.");
//                 }
//               }}
//               disabled={isAssigning}
//             >
//               {isAssigning ? "Đang xử lý..." : "Xác nhận"}
//             </button>
//           </div>
//         </div>
//       ),
//       { duration: Infinity }
//     );
//   };

//   const handleViewPaperDetail = async (presenter: any) => {
//     const paperId = presenter.paperId;
//     if (!paperId) {
//       toast.error("Không tìm thấy paper ID.");
//       return;
//     }

//     setLoadingPaper(true);
//     try {
//       const url = `/api/papers/${paperId}${conferenceId ? `?conferenceId=${conferenceId}` : ""}`;
//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error("Không thể tải dữ liệu paper.");
//       }

//       const result = await response.json();

//       if (result.success && Array.isArray(result.data) && result.data.length > 0) {
//         setSelectedPaperData(result.data[0]);
//         setViewPaperDetail(true);
//       } else {
//         toast.error("Không tìm thấy thông tin bài báo.");
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải chi tiết paper:", error);
//       toast.error("Không thể tải thông tin bài báo. Vui lòng thử lại.");
//     } finally {
//       setLoadingPaper(false);
//     }
//   };

//   const handleViewDocument = (fileUrl: string, fileName: string) => {
//     setCurrentDoc({ uri: fileUrl, fileName });
//     setViewerOpen(true);
//   };

//   const handleBackToSession = () => {
//     setViewPaperDetail(false);
//     setSelectedPaperData(null);
//   };

//   const hasSelectedPaper = !!selectedPaperId;

//   return (
//     <>
//       {/* Session Detail Dialog */}
//       <Dialog open={open && !viewPaperDetail} onOpenChange={onClose}>
//         <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold text-gray-900">
//               Chi tiết session trình bày
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-5 py-3">
//             <div className="space-y-2">
//               <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                 <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs font-medium text-gray-500 mb-0.5">Ngày diễn ra</p>
//                   <p className="text-sm font-medium text-gray-900">{formatDate(session.onDate)}</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                 <Users className="w-4 h-4 text-blue-600 mt-0.5" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs font-medium text-gray-500 mb-0.5">Số lượng presenter</p>
//                   <p className="text-sm font-medium text-gray-900">{session.presenters.length} người</p>
//                 </div>
//               </div>
//             </div>

//             {hasSelectedPaper && (
//               <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
//                 <p className="text-sm text-green-800">
//                   Đã chọn bài báo. Click nút <strong>&quot;Gán presenter&quot;</strong> bên dưới để gán vào session này.
//                 </p>
//               </div>
//             )}

//             <div className="space-y-3">
//               <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
//                 <h4 className="text-sm font-semibold text-gray-900">
//                   Danh sách presenter ({session.presenters.length})
//                 </h4>
//               </div>

//               {session.presenters.length === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
//                   <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
//                   <p className="text-sm text-gray-500">Chưa có presenter nào được gán</p>
//                   <p className="text-xs text-gray-400 mt-1">
//                     Vui lòng chọn bài báo từ danh sách để gán vào session này
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
//                   {session.presenters.map((presenter, index) => (
//                     <div
//                       key={`${presenter.paperId || index}`}
//                       className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
//                     >
//                       <div className="mt-0.5">
//                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
//                           <User className="w-4 h-4 text-blue-600" />
//                         </div>
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold text-gray-900 mb-1">{presenter.presenterName}</p>
//                         <div className="flex items-start gap-2">
//                           <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
//                           <p className="text-xs text-gray-600 leading-relaxed">{presenter.paperTitle}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                           #{index + 1}
//                         </span>
//                         <button
//                           onClick={() => handleViewPaperDetail(presenter)}
//                           disabled={loadingPaper}
//                           className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-blue-50 rounded-md disabled:opacity-50"
//                           title="Xem chi tiết paper"
//                         >
//                           {loadingPaper ? (
//                             <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
//                           ) : (
//                             <ChevronRight className="w-4 h-4 text-blue-600" />
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {!hasSelectedPaper && (
//               <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                   <path
//                     fillRule="evenodd"
//                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 <p className="text-xs text-blue-800">
//                   Để gán presenter, vui lòng chọn bài báo từ danh sách bên phải trước.
//                 </p>
//               </div>
//             )}
//           </div>

//           <DialogFooter className="gap-2">
//             <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-50">
//               Đóng
//             </Button>
//             {hasSelectedPaper && (
//               <Button
//                 onClick={handleAssignPresenter}
//                 disabled={isAssigning}
//                 className="bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 {isAssigning ? (
//                   <>
//                     <svg
//                       className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C18 0 20 2 20 12h-4zm-4 8v-8h4a8 8 0 00-8-8V4a12 12 0 0112 12h-4z"
//                       ></path>
//                     </svg>
//                     Đang gán...
//                   </>
//                 ) : (
//                   "Gán presenter"
//                 )}
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Paper Detail Dialog */}
//       <Dialog
//         open={open && viewPaperDetail}
//         onOpenChange={(isOpen) => {
//           if (!isOpen) handleBackToSession();
//         }}
//       >
//         <DialogContent className="bg-white border-gray-200 max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader className="flex flex-row items-center gap-3">
//             <button
//               onClick={handleBackToSession}
//               className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
//               aria-label="Quay lại"
//             >
//               <ArrowLeft className="w-4 h-4 text-gray-600" />
//             </button>
//             <DialogTitle className="text-lg font-semibold text-gray-900 truncate">Chi tiết bài báo</DialogTitle>
//           </DialogHeader>

//           <div className="py-3">
//             {selectedPaperData ? (
//               <PaperDetailViewContent paper={selectedPaperData} onViewDocument={handleViewDocument} />
//             ) : (
//               <div className="text-center py-8 text-gray-500">Đang tải...</div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Document Viewer */}
//       {viewerOpen && currentDoc && (
//         <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
//           <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h3 className="font-medium text-gray-900 truncate">{currentDoc.fileName}</h3>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setViewerOpen(false)}
//                 className="h-8 w-8 p-0"
//               >
//                 <X className="w-4 h-4" />
//               </Button>
//             </div>
//             <div className="flex-1 overflow-hidden">
//               <DocViewer
//                 documents={[{ uri: currentDoc.uri, fileName: currentDoc.fileName }]}
//                 pluginRenderers={DocViewerRenderers}
//                 config={{
//                   header: { disableHeader: true },
//                   noRenderer: { overrideComponent: () => <div className="flex items-center justify-center h-full text-gray-500">Không thể xem file này</div> },
//                 }}
//                 className="h-full"
//               />
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </>
//   );
// };

// export default PresenterSessionDetailDialog;