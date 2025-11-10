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
} from "lucide-react";
import { usePaperCustomer } from "@/redux/hooks/paper/usePaper";
import type { PaperCustomer } from "@/types/paper.type";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function PaperCard({ paper }: { paper: PaperCustomer }) {
  const router = useRouter();

  const getPhaseStatus = () => {
    const phases = [
      { name: "Tóm tắt (Abstract)", available: !!paper.abstractId },
      { name: "Bài đầy đủ (Full Paper)", available: !!paper.fullPaperId },
      { name: "Bản chỉnh sửa (Revision)", available: !!paper.revisionPaperId },
      { name: "Camera Ready", available: !!paper.cameraReadyId },
    ];

    return phases.map((phase, index) => (
      <div
        key={index}
        className="flex items-center gap-2 text-sm text-gray-300"
      >
        <Badge
          className={
            phase.available
              ? "bg-green-600/80 text-white"
              : "bg-gray-700 text-gray-300"
          }
        >
          {phase.name}: {phase.available ? "Đã mở" : "Chưa diễn ra"}
        </Badge>
      </div>
    ));
  };

  return (
    <Card className="overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-700 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white leading-tight">
              Mã bài báo: {paper.paperId}
            </h2>
            {paper.title && (
              <h2 className="text-xl font-semibold text-white leading-tight">
                Tên bài báo: {paper.title}
              </h2>
            )}

            {paper.description && (
              <h2 className="text-xl font-semibold text-white leading-tight">
                Miêu tả về bài báo: {paper.description}
              </h2>
            )}
            {paper.conferenceId && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <BookOpen className="h-4 w-4" />
                <span>Mã hội nghị: {paper.conferenceId}</span>
              </div>
            )}
            {paper.createdAt && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Nộp ngày:{" "}
                  {new Date(paper.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}
            <div className="mt-3 space-y-1">{getPhaseStatus()}</div>
            {/* {paper.paperPhaseId && (
                            <Badge className="bg-yellow-600/80 text-white font-medium">
                                Phase: {paper.paperPhaseId}
                            </Badge>
                        )} */}
          </div>

          {/* Right actions */}
          <div className="flex gap-2 md:flex-col lg:flex-row md:items-end">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
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
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl sm:text-4xl font-bold">Bài báo đã nộp</h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Danh sách các bài nghiên cứu bạn đã nộp cho các hội nghị
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-gray-400 text-center py-10">Đang tải bài báo...</p>
        )}

        {/* Error */}
        {!loading && submittedPapersError && (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-gray-500 mb-4">{getErrorMessage()}</p>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
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
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
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
