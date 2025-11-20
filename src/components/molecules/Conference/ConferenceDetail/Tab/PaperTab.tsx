import { FileText, User, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSubmittedPapersQuery, useGetAssignReviewersQuery } from "@/redux/services/statistics.service";
import { skipToken } from "@reduxjs/toolkit/query/react";
import Link from "next/link";

interface PaperTabProps {
  conferenceId: string;
}

export function PaperTab({ conferenceId }: PaperTabProps) {
  const {
    data: papersData,
    isLoading: isLoadingPapers,
    isError: isErrorPapers,
  } = useGetSubmittedPapersQuery(conferenceId ? conferenceId : skipToken);

  const {
    data: reviewersData,
    isLoading: isLoadingReviewers,
    isError: isErrorReviewers,
  } = useGetAssignReviewersQuery(conferenceId ? conferenceId : skipToken);

  const isLoading = isLoadingPapers || isLoadingReviewers;
  const isError = isErrorPapers || isErrorReviewers;

  const formatPhase = (phase: string) => {
    const mapping: Record<string, string> = {
      Abstract: "Đã nộp abstract",
      FullPaper: "Đã nộp full paper",
      CameraReady: "Đã nộp bản in",
      Registration: "Đã đăng ký",
      Presentation: "Sẵn sàng trình bày",
    };
    return mapping[phase] || phase;
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-600">Đang tải dữ liệu...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
        <p className="text-gray-500">Không thể lấy danh sách bài báo hoặc phản biện.</p>
      </div>
    );
  }

  const papers = papersData?.data?.paperDetails || [];
  const reviewers = reviewersData?.data || [];

  return (
    <div className="space-y-8">
      {/* === Danh sách Bài báo === */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Bài báo đã nộp ({papers.length})
          </h2>
          <Link href="/workspace/organizer/manage-paper/pending-abstract-list">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Quản lý bài báo
            </Button>
          </Link>
        </div>

        {papers.length === 0 ? (
          <div className="text-sm text-gray-500 italic">Chưa có bài báo nào được nộp.</div>
        ) : (
          <div className="space-y-3">
            {papers.map((paper) => (
              <div
                key={paper.paperId}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <h3 className="font-bold text-gray-900">{paper.title}</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Tác giả ID: {paper.submittingAuthorId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Trạng thái: {formatPhase(paper.paperPhase)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      Phản biện đã gán: {paper.assignedReviewers?.length || 0}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href={`/workspace/organizer/paper/${paper.paperId}`}>
                    <Button variant="ghost" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* === Danh sách Reviewer === */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Danh sách Phản biện ({reviewers.length})
        </h2>

        {reviewers.length === 0 ? (
          <div className="text-sm text-gray-500 italic">Chưa có phản biện nào được phân công.</div>
        ) : (
          <div className="space-y-3">
            {reviewers.map((reviewer) => (
              <div
                key={reviewer.reviewerId}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{reviewer.reviewerName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">ID:</span> {reviewer.reviewerId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">
                      Đã gán:{" "}
                      <span className="font-semibold text-primary">
                        {reviewer.assignedPaperCount} bài báo
                      </span>
                    </p>
                    {reviewer.paperIds && reviewer.paperIds.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Bài báo: {reviewer.paperIds.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}