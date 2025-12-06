"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Ban,
} from "lucide-react";
import { usePaperCustomer } from "@/redux/hooks/usePaper";
import type { PaperCustomer } from "@/types/paper.type";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function PaperCard({ paper }: { paper: PaperCustomer }) {
  const router = useRouter();

  const getPhaseInfo = () => {
    // Kiểm tra giai đoạn bị reject
    let rejectedPhase: string | null = null;

    if (paper.abstract?.globalStatusName === "Rejected") {
      rejectedPhase = "Abstract";
    } else if (paper.fullPaper?.reviewStatusName === "Rejected") {
      rejectedPhase = "Full Paper";
    } else if (paper.revisionPaper?.globalStatusName === "Rejected") {
      rejectedPhase = "Revision";
    }

    const isRevisionSkipped =
      paper.fullPaper?.reviewStatusName === "Accepted";

    const phases = [
      {
        name: "Tóm tắt (Abstract)",
        hasData: !!paper.abstractId,
        status: paper.abstract?.globalStatusName || null,
      },
      {
        name: "Bài đầy đủ (Full Paper)",
        hasData: !!paper.fullPaperId,
        status: paper.fullPaper?.reviewStatusName || null,
      },
      {
        name: "Bản chỉnh sửa (Revision)",
        hasData: !!paper.revisionPaperId,
        status: paper.revisionPaper?.globalStatusName || null,
        isSkipped: isRevisionSkipped,
      },
      {
        name: "Camera Ready",
        hasData: !!paper.cameraReadyId,
        status: null,
      },
    ];

    // Logic cho Camera Ready: chỉ hiện nếu fullPaper hoặc revision được accepted
    const canShowCameraReady =
      paper.fullPaper?.reviewStatusName === "Accepted" ||
      paper.revisionPaper?.globalStatusName === "Accepted";

    return phases.map((phase, index) => {
      let badgeColor = "bg-gray-200 text-gray-700";
      let statusText = "Chưa nộp";
      let icon = null;
      let isBlocked = false;

      // Kiểm tra nếu giai đoạn này bị block do reject ở giai đoạn trước
      if (rejectedPhase) {
        const rejectedIndex = phases.findIndex(
          (p) => p.name.includes(rejectedPhase!)
        );
        if (index > rejectedIndex) {
          isBlocked = true;
        }
      }

      if (phase.name === "Bản chỉnh sửa (Revision)" && phase.isSkipped) {
        badgeColor = "bg-gray-300 text-gray-600";
        statusText = "Bỏ qua (Full Paper đã được chấp nhận)";
        icon = <CheckCircle className="h-3 w-3" />;
        return (
          <div key={index} className="flex items-center gap-2 text-sm opacity-70">
            <Badge className={`${badgeColor} flex items-center gap-1.5`}>
              {icon}
              <span>{phase.name}: {statusText}</span>
            </Badge>
          </div>
        );
      }

      // Logic cho Camera Ready đặc biệt
      if (phase.name === "Camera Ready") {
        if (!canShowCameraReady && !isBlocked) {
          isBlocked = true;
        }
        if (phase.hasData) {
          badgeColor = "bg-green-500 text-white";
          statusText = "Đã nộp";
          icon = <CheckCircle className="h-3 w-3" />;
        } else if (isBlocked) {
          badgeColor = "bg-gray-100 text-gray-400";
          statusText = rejectedPhase
            ? `Không thể tiếp tục (Bị từ chối ở ${rejectedPhase})`
            : "Chưa đủ điều kiện";
          icon = <Ban className="h-3 w-3" />;
        }
      } else {
        // Logic cho các giai đoạn khác
        if (isBlocked) {
          badgeColor = "bg-gray-100 text-gray-400";
          statusText = `Không thể tiếp tục (Bị từ chối ở ${rejectedPhase})`;
          icon = <Ban className="h-3 w-3" />;
        } else if (!phase.hasData) {
          badgeColor = "bg-gray-200 text-gray-700";
          statusText = "Chưa nộp";
        } else if (phase.status === "Pending") {
          badgeColor = "bg-yellow-500 text-white";
          statusText = "Đang chờ xét duyệt";
          icon = <Loader className="h-3 w-3 animate-spin" />;
        } else if (phase.status === "Accepted" || phase.status === "Approved") {
          badgeColor = "bg-green-500 text-white";
          statusText = "Đã chấp nhận";
          icon = <CheckCircle className="h-3 w-3" />;
        } else if (phase.status === "Rejected") {
          badgeColor = "bg-red-500 text-white";
          statusText = "Đã từ chối";
          icon = <XCircle className="h-3 w-3" />;
        } else if (phase.status === "Revise") {
          badgeColor = "bg-blue-500 text-white";
          statusText = "Cần chỉnh sửa";
          icon = <AlertCircle className="h-3 w-3" />;
        }
      }

      return (
        <div
          key={index}
          className={`flex items-center gap-2 text-sm ${isBlocked ? "opacity-50" : ""
            }`}
        >
          <Badge className={`${badgeColor} flex items-center gap-1.5`}>
            {icon}
            <span>
              {phase.name}: {statusText}
            </span>
          </Badge>
        </div>
      );
    });
  };

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 leading-tight">
              Mã bài báo: {paper.paperId}
            </h2>

            {(paper.title || paper.paperTitle) && (
              <div className="space-y-1">
                <span className="text-sm text-gray-500">Tiêu đề:</span>
                <h3 className="text-lg font-medium text-gray-900">
                  {paper.title || paper.paperTitle}
                </h3>
              </div>
            )}

            {(paper.description || paper.paperDescription) && (
              <div className="space-y-1">
                <span className="text-sm text-gray-500">Mô tả:</span>
                <p className="text-sm text-gray-700">
                  {paper.description || paper.paperDescription}
                </p>
              </div>
            )}

            {(paper.conferenceId || paper.conferenceName) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>
                  {paper.conferenceName
                    ? `Hội nghị: ${paper.conferenceName}`
                    : `Mã hội nghị: ${paper.conferenceId}`}
                </span>
              </div>
            )}

            {paper.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Nộp ngày:{" "}
                  {new Date(paper.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}

            {paper.phaseName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Giai đoạn hiện tại: {paper.phaseName}</span>
              </div>
            )}

            <div className="mt-3 space-y-1">{getPhaseInfo()}</div>
          </div>

          {/* Right actions */}
          <div className="flex gap-2 md:flex-col lg:flex-row md:items-end">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => router.push(`/customer/papers/${paper.paperId}`)}
            >
              Xem chi tiết
              <Clock className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
            >
              Đến hội nghị
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerPaperList() {
  const {
    submittedPapers,
    loading,
    submittedPapersError,
    fetchSubmittedPapers,
  } = usePaperCustomer();

  useEffect(() => {
    fetchSubmittedPapers();
  }, [fetchSubmittedPapers]);

  const getErrorMessage = (): string => {
    if (!submittedPapersError) return "";

    if (submittedPapersError.data?.message) {
      return submittedPapersError.data.message;
    }

    if (submittedPapersError.data?.errors) {
      const errors = Object.values(submittedPapersError.data.errors);
      return errors.length > 0 ? errors[0] : "Có lỗi xảy ra khi tải dữ liệu";
    }

    return "Có lỗi xảy ra khi tải dữ liệu";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold">Bài báo đã nộp</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            Danh sách các bài nghiên cứu bạn đã nộp cho các hội nghị
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-gray-600 text-center py-10">Đang tải bài báo...</p>
        )}

        {/* Error */}
        {!loading && submittedPapersError && (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-gray-500 mb-4">{getErrorMessage()}</p>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Paper list */}
        {!loading && !submittedPapersError && (
          <div className="space-y-6">
            {submittedPapers.length > 0 ? (
              submittedPapers.map((paper) => (
                <PaperCard key={paper.paperId} paper={paper} />
              ))
            ) : (
              <div className="text-center py-20">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Bạn chưa nộp bài báo nào
                </h3>
                <p className="text-gray-500">
                  Hãy tham gia một hội nghị và nộp bài của bạn ngay hôm nay
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerPaperList;

// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   FileText,
//   BookOpen,
//   Calendar,
//   Clock,
//   ExternalLink,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Loader,
//   Ban,
// } from "lucide-react";
// import { usePaperCustomer } from "@/redux/hooks/usePaper";
// import type { PaperCustomer } from "@/types/paper.type";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// function PaperCard({ paper }: { paper: PaperCustomer }) {
//   const router = useRouter();

//   const getPhaseInfo = () => {
//     // Kiểm tra giai đoạn bị reject
//     let rejectedPhase: string | null = null;

//     if (paper.abstract?.globalStatusName === "Rejected") {
//       rejectedPhase = "Abstract";
//     } else if (paper.fullPaper?.reviewStatusName === "Rejected") {
//       rejectedPhase = "Full Paper";
//     } else if (paper.revisionPaper?.globalStatusName === "Rejected") {
//       rejectedPhase = "Revision";
//     }

//     const isRevisionSkipped =
//       paper.fullPaper?.reviewStatusName === "Accepted";

//     const phases = [
//       {
//         name: "Tóm tắt (Abstract)",
//         hasData: !!paper.abstractId,
//         status: paper.abstract?.globalStatusName || null,
//       },
//       {
//         name: "Bài đầy đủ (Full Paper)",
//         hasData: !!paper.fullPaperId,
//         status: paper.fullPaper?.reviewStatusName || null,
//       },
//       {
//         name: "Bản chỉnh sửa (Revision)",
//         hasData: !!paper.revisionPaperId,
//         status: paper.revisionPaper?.globalStatusName || null,
//         isSkipped: isRevisionSkipped,
//       },
//       {
//         name: "Camera Ready",
//         hasData: !!paper.cameraReadyId,
//         status: null,
//       },
//     ];

//     // Logic cho Camera Ready: chỉ hiện nếu fullPaper hoặc revision được accepted
//     const canShowCameraReady =
//       paper.fullPaper?.reviewStatusName === "Accepted" ||
//       paper.revisionPaper?.globalStatusName === "Accepted";

//     return phases.map((phase, index) => {
//       let badgeColor = "bg-gray-700 text-gray-300";
//       let statusText = "Chưa nộp";
//       let icon = null;
//       let isBlocked = false;

//       // Kiểm tra nếu giai đoạn này bị block do reject ở giai đoạn trước
//       if (rejectedPhase) {
//         const rejectedIndex = phases.findIndex(
//           (p) => p.name.includes(rejectedPhase!)
//         );
//         if (index > rejectedIndex) {
//           isBlocked = true;
//         }
//       }

//       if (phase.name === "Bản chỉnh sửa (Revision)" && phase.isSkipped) {
//         badgeColor = "bg-gray-600/60 text-gray-300";
//         statusText = "Bỏ qua (Full Paper đã được chấp nhận)";
//         icon = <CheckCircle className="h-3 w-3" />;
//         return (
//           <div key={index} className="flex items-center gap-2 text-sm opacity-70">
//             <Badge className={`${badgeColor} flex items-center gap-1.5`}>
//               {icon}
//               <span>{phase.name}: {statusText}</span>
//             </Badge>
//           </div>
//         );
//       }

//       // Logic cho Camera Ready đặc biệt
//       if (phase.name === "Camera Ready") {
//         if (!canShowCameraReady && !isBlocked) {
//           isBlocked = true;
//         }
//         if (phase.hasData) {
//           badgeColor = "bg-green-600/80 text-white";
//           statusText = "Đã nộp";
//           icon = <CheckCircle className="h-3 w-3" />;
//         } else if (isBlocked) {
//           badgeColor = "bg-gray-800 text-gray-500";
//           statusText = rejectedPhase
//             ? `Không thể tiếp tục (Bị từ chối ở ${rejectedPhase})`
//             : "Chưa đủ điều kiện";
//           icon = <Ban className="h-3 w-3" />;
//         }
//       } else {
//         // Logic cho các giai đoạn khác
//         if (isBlocked) {
//           badgeColor = "bg-gray-800 text-gray-500";
//           statusText = `Không thể tiếp tục (Bị từ chối ở ${rejectedPhase})`;
//           icon = <Ban className="h-3 w-3" />;
//         } else if (!phase.hasData) {
//           badgeColor = "bg-gray-700 text-gray-300";
//           statusText = "Chưa nộp";
//         } else if (phase.status === "Pending") {
//           badgeColor = "bg-yellow-600/80 text-white";
//           statusText = "Đang chờ xét duyệt";
//           icon = <Loader className="h-3 w-3 animate-spin" />;
//         } else if (phase.status === "Accepted" || phase.status === "Approved") {
//           badgeColor = "bg-green-600/80 text-white";
//           statusText = "Đã chấp nhận";
//           icon = <CheckCircle className="h-3 w-3" />;
//         } else if (phase.status === "Rejected") {
//           badgeColor = "bg-red-600/80 text-white";
//           statusText = "Đã từ chối";
//           icon = <XCircle className="h-3 w-3" />;
//         } else if (phase.status === "Revise") {
//           badgeColor = "bg-blue-600/80 text-white";
//           statusText = "Cần chỉnh sửa";
//           icon = <AlertCircle className="h-3 w-3" />;
//         }
//       }

//       return (
//         <div
//           key={index}
//           className={`flex items-center gap-2 text-sm ${isBlocked ? "opacity-50" : ""
//             }`}
//         >
//           <Badge className={`${badgeColor} flex items-center gap-1.5`}>
//             {icon}
//             <span>
//               {phase.name}: {statusText}
//             </span>
//           </Badge>
//         </div>
//       );
//     });
//   };

//   return (
//     <Card className="overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-700 hover:shadow-md transition-all">
//       <CardContent className="p-6">
//         <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//           {/* Left */}
//           <div className="space-y-3">
//             <h2 className="text-xl font-semibold text-white leading-tight">
//               Mã bài báo: {paper.paperId}
//             </h2>

//             {(paper.title || paper.paperTitle) && (
//               <div className="space-y-1">
//                 <span className="text-sm text-gray-400">Tiêu đề:</span>
//                 <h3 className="text-lg font-medium text-white">
//                   {paper.title || paper.paperTitle}
//                 </h3>
//               </div>
//             )}

//             {(paper.description || paper.paperDescription) && (
//               <div className="space-y-1">
//                 <span className="text-sm text-gray-400">Mô tả:</span>
//                 <p className="text-sm text-gray-300">
//                   {paper.description || paper.paperDescription}
//                 </p>
//               </div>
//             )}

//             {(paper.conferenceId || paper.conferenceName) && (
//               <div className="flex items-center gap-2 text-sm text-gray-400">
//                 <BookOpen className="h-4 w-4" />
//                 <span>
//                   {paper.conferenceName
//                     ? `Hội nghị: ${paper.conferenceName}`
//                     : `Mã hội nghị: ${paper.conferenceId}`}
//                 </span>
//               </div>
//             )}

//             {paper.createdAt && (
//               <div className="flex items-center gap-2 text-sm text-gray-400">
//                 <Calendar className="h-4 w-4" />
//                 <span>
//                   Nộp ngày:{" "}
//                   {new Date(paper.createdAt).toLocaleDateString("vi-VN")}
//                 </span>
//               </div>
//             )}

//             {paper.phaseName && (
//               <div className="flex items-center gap-2 text-sm text-gray-400">
//                 <Clock className="h-4 w-4" />
//                 <span>Giai đoạn hiện tại: {paper.phaseName}</span>
//               </div>
//             )}

//             <div className="mt-3 space-y-1">{getPhaseInfo()}</div>
//           </div>

//           {/* Right actions */}
//           <div className="flex gap-2 md:flex-col lg:flex-row md:items-end">
//             <Button
//               variant="outline"
//               size="sm"
//               className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
//               onClick={() => router.push(`/customer/papers/${paper.paperId}`)}
//             >
//               Xem chi tiết
//               <Clock className="h-4 w-4 ml-1" />
//             </Button>
//             <Button
//               variant="default"
//               size="sm"
//               className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
//             >
//               Đến hội nghị
//               <ExternalLink className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function CustomerPaperList() {
//   const {
//     submittedPapers,
//     loading,
//     submittedPapersError,
//     fetchSubmittedPapers,
//   } = usePaperCustomer();

//   useEffect(() => {
//     fetchSubmittedPapers();
//   }, [fetchSubmittedPapers]);

//   const getErrorMessage = (): string => {
//     if (!submittedPapersError) return "";

//     if (submittedPapersError.data?.message) {
//       return submittedPapersError.data.message;
//     }

//     if (submittedPapersError.data?.errors) {
//       const errors = Object.values(submittedPapersError.data.errors);
//       return errors.length > 0 ? errors[0] : "Có lỗi xảy ra khi tải dữ liệu";
//     }

//     return "Có lỗi xảy ra khi tải dữ liệu";
//   };

//   return (
//     <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <FileText className="h-8 w-8 text-blue-500" />
//             <h1 className="text-3xl sm:text-4xl font-bold">Bài báo đã nộp</h1>
//           </div>
//           <p className="text-gray-400 text-sm sm:text-base">
//             Danh sách các bài nghiên cứu bạn đã nộp cho các hội nghị
//           </p>
//         </div>

//         {/* Loading */}
//         {loading && (
//           <p className="text-gray-400 text-center py-10">Đang tải bài báo...</p>
//         )}

//         {/* Error */}
//         {!loading && submittedPapersError && (
//           <div className="text-center py-20">
//             <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-red-400 mb-2">
//               Lỗi tải dữ liệu
//             </h3>
//             <p className="text-gray-500 mb-4">{getErrorMessage()}</p>
//             <Button
//               variant="outline"
//               className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
//               onClick={() => window.location.reload()}
//             >
//               Thử lại
//             </Button>
//           </div>
//         )}

//         {/* Paper list */}
//         {!loading && !submittedPapersError && (
//           <div className="space-y-6">
//             {submittedPapers.length > 0 ? (
//               submittedPapers.map((paper) => (
//                 <PaperCard key={paper.paperId} paper={paper} />
//               ))
//             ) : (
//               <div className="text-center py-20">
//                 <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-400 mb-2">
//                   Bạn chưa nộp bài báo nào
//                 </h3>
//                 <p className="text-gray-500">
//                   Hãy tham gia một hội nghị và nộp bài của bạn ngay hôm nay
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CustomerPaperList;
