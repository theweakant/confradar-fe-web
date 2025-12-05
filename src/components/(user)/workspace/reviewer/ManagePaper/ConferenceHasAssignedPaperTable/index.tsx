"use client";

import { AssignedPaperDetail } from "@/types/paper.type";

import React from "react";
import { Eye, MoreVertical } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { ConferenceResponse } from "@/types/conference.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// interface ConferenceHasAssignedPaperTableProps {
//   conferences: ConferenceResponse[];
//   onView?: (conference: ConferenceResponse) => void;
// }

// export function ConferenceHasAssignedPaperTable({
//   conferences,
//   onView,
// }: ConferenceHasAssignedPaperTableProps) {
//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("vi-VN");
//   };

//   const columns: Column<ConferenceResponse>[] = [
//     {
//       key: "conferenceName",
//       header: "Tên hội nghị",
//       render: (conference) => (
//         <div className="font-medium text-sm text-gray-900">
//           {conference.conferenceName || "N/A"}
//         </div>
//       ),
//     },
//     {
//       key: "conferenceId",
//       header: "Conference ID",
//       render: (conference) => (
//         <div className="font-mono text-sm text-gray-600">
//           {conference.conferenceId}
//         </div>
//       ),
//     },
//     {
//       key: "startDate",
//       header: "Ngày bắt đầu",
//       render: (conference) => (
//         <div className="text-sm text-gray-600">
//           {formatDate(conference.startDate)}
//         </div>
//       ),
//     },
//     {
//       key: "endDate",
//       header: "Ngày kết thúc",
//       render: (conference) => (
//         <div className="text-sm text-gray-600">
//           {formatDate(conference.endDate)}
//         </div>
//       ),
//     },
//     {
//       key: "isResearchConference",
//       header: "Loại",
//       render: (conference) => (
//         <div className="text-sm">
//           <span
//             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conference.isResearchConference
//               ? "bg-blue-100 text-blue-800"
//               : "bg-purple-100 text-purple-800"
//               }`}
//           >
//             {conference.isResearchConference ? "Nghiên cứu" : "Kỹ thuật"}
//           </span>
//         </div>
//       ),
//     },
//     {
//       key: "actions",
//       header: "Hành động",
//       className: "text-right",
//       render: (conference) => (
//         <div className="flex items-center justify-end">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                 <MoreVertical className="w-5 h-5 text-gray-600" />
//               </button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-44">
//               <DropdownMenuItem
//                 onClick={() => onView?.(conference)}
//                 className="cursor-pointer"
//               >
//                 <Eye className="w-4 h-4 mr-2 text-green-600" />
//                 <span>Xem chi tiết</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <DataTable
//       columns={columns}
//       data={conferences}
//       keyExtractor={(conference) => conference.conferenceId}
//       emptyMessage="Không tìm thấy hội nghị nào có bài báo được phân công"
//     />
//   );
// }

// Thay đổi interface props
interface AssignedPapersTableProps {
  papers: AssignedPaperDetail[];
  onView?: (paper: AssignedPaperDetail) => void;
}

export function AssignedPapersTable({
  papers,
  onView,
}: AssignedPapersTableProps) {

  // Helper function để render status badge
  const renderStatusBadge = (statusName: string | null, isSubmitted?: boolean | null) => {
    if (!statusName) return <span className="text-xs text-gray-400">N/A</span>;

    const colors: Record<string, string> = {
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Review': 'bg-blue-100 text-blue-800',
    };

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[statusName] || 'bg-gray-100 text-gray-800'}`}>
          {statusName}
        </span>
        {isSubmitted !== null && (
          <span className={`text-xs ${isSubmitted ? 'text-green-600' : 'text-orange-600'}`}>
            {isSubmitted ? '✓ Đã review' : '○ Chưa review'}
          </span>
        )}
      </div>
    );
  };

  const columns: Column<AssignedPaperDetail>[] = [
    {
      key: "title",
      header: "Tiêu đề bài báo",
      render: (paper) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm text-gray-900 truncate">
            {paper.title || "N/A"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {paper.conferenceName || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "currentPhaseName",
      header: "Phase hiện tại",
      render: (paper) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {paper.currentPhaseName || "N/A"}
        </span>
      ),
    },
    {
      key: "isHeadReviewer",
      header: "Vai trò",
      render: (paper) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paper.isHeadReviewer
          ? 'bg-purple-100 text-purple-800'
          : 'bg-gray-100 text-gray-700'
          }`}>
          {paper.isHeadReviewer ? "Head Reviewer" : "Reviewer"}
        </span>
      ),
    },
    {
      key: "fullPaper",
      header: "Full Paper",
      render: (paper) => {
        if (!paper.fullPaperWork?.fullPaperId) {
          return <span className="text-xs text-gray-400">Chưa có</span>;
        }
        return (
          <div className="text-xs space-y-1">
            {renderStatusBadge(
              paper.fullPaperWork.statusName,
              paper.fullPaperWork.isMyReviewSubmitted
            )}
            {paper.fullPaperWork.myReviewResult && (
              <div className="text-xs text-gray-600">
                Kết quả: {paper.fullPaperWork.myReviewResult}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "revision",
      header: "Revision",
      render: (paper) => {
        if (!paper.revisionWork?.revisionPaperId) {
          return <span className="text-xs text-gray-400">Chưa có</span>;
        }
        return (
          <div className="text-xs space-y-1">
            <div className="text-gray-600">Round {paper.revisionWork.revisionRound}</div>
            {renderStatusBadge(
              paper.revisionWork.statusName,
              paper.revisionWork.isMyReviewSubmitted
            )}
            {paper.revisionWork.isFeedbackSubmitted !== null && (
              <span className={`text-xs ${paper.revisionWork.isFeedbackSubmitted ? 'text-green-600' : 'text-orange-600'}`}>
                {paper.revisionWork.isFeedbackSubmitted ? '✓ Đã feedback' : '○ Chưa feedback'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "cameraReady",
      header: "Camera Ready",
      render: (paper) => {
        if (!paper.cameraReadyWork?.cameraReadyId) {
          return <span className="text-xs text-gray-400">Chưa có</span>;
        }
        return renderStatusBadge(paper.cameraReadyWork.statusName);
      },
    },
    {
      key: "actions",
      header: "Hành động",
      className: "text-right",
      render: (paper) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => onView?.(paper)}
              className="cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-2 text-green-600" />
              <span>Xem chi tiết</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={papers}
      keyExtractor={(paper) => paper.paperId || Math.random().toString()}
      emptyMessage="Không tìm thấy bài báo nào được phân công"
    />
  );
}