"use client";

import { FileText, User, Calendar, Users, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const phaseStyles: Record<string, { bg: string; text: string }> = {
    Abstract: { bg: "bg-blue-100", text: "text-blue-800" },
    FullPaper: { bg: "bg-emerald-100", text: "text-emerald-800" },
    Revision: { bg: "bg-amber-100", text: "text-amber-800" },
    CameraReady: { bg: "bg-purple-100", text: "text-purple-800" },
    default: { bg: "bg-gray-100", text: "text-gray-800" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
        <p className="text-gray-500">Không thể lấy danh sách bài báo hoặc phản biện.</p>
      </div>
    );
  }

  const papers = papersData?.data?.paperDetails || [];
  const reviewers = reviewersData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 justify-end">
        <Link href="/workspace/organizer/manage-conference/assign-paper/pending-abstract-list">
          <Button variant="outline" size="sm" className="gap-2">
            <Clock className="w-4 h-4" />
            Chờ duyệt
          </Button>
        </Link>
        <Link href="/workspace/organizer/manage-conference/assign-paper">
          <Button size="sm" className="gap-2">
            <Users className="w-4 h-4" />
            Phân công
          </Button>
        </Link>
      </div>

      <section className="bg-white rounded-xl p-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 inline">Bài báo đã nộp</h2>
            <span className="text-sm text-gray-500 ml-2">({papers.length} bài báo)</span>
          </div>
        </div>

        {papers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có bài báo nào được nộp</p>
          </div>
        ) : (
          <div className="space-y-3">
            {papers.map((paper) => (
              <div
                key={paper.paperId}
                className="group p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/30 hover:shadow-md transition-all duration-200 bg-white"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="flex items-start gap-3 flex-[4]">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                        {paper.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="truncate">#{paper.submittingAuthorId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Reviewers - 20% */}
                  <div className="flex-[2]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex -space-x-2">
                        {paper.assignedReviewers && paper.assignedReviewers.length > 0 ? (
                          <>
                            {paper.assignedReviewers.slice(0, 3).map((reviewer, idx) => (
                              <Avatar key={idx} className="w-8 h-8 ring-2 ring-white">
                                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xs font-medium">
                                  {reviewer.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {paper.assignedReviewers.length > 3 && (
                              <Avatar className="w-8 h-8 ring-2 ring-white">
                                <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-medium">
                                  +{paper.assignedReviewers.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </>
                        ) : (
                          <Avatar className="w-8 h-8 ring-2 ring-white">
                            <AvatarFallback className="bg-gray-100">
                              <Users className="w-4 h-4 text-gray-400" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {paper.assignedReviewers?.length || 0} Người
                      </span>
                    </div>
                  </div>

                  {/* Phase Status - 20% */}
                  <div className="flex-[2]">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Giai đoạn</div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          phaseStyles[paper.paperPhase]?.bg || phaseStyles.default.bg
                        } ${phaseStyles[paper.paperPhase]?.text || phaseStyles.default.text}`}
                      >
                        {paper.paperPhase}
                      </span>
                    </div>
                  </div>

                  {/* Stage Progress - 20% */}
                  <div className="flex-[2]">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Tiến độ</div>
                      <div className="flex gap-1 justify-center">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            ["Abstract", "FullPaper", "Revision", "CameraReady"].includes(paper.paperPhase)
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            ["FullPaper", "Revision", "CameraReady"].includes(paper.paperPhase)
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            ["Revision", "CameraReady"].includes(paper.paperPhase)
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            paper.paperPhase === "CameraReady" ? "bg-green-500" : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* === Danh sách Reviewer === */}
      <section className="bg-white rounded-xl p-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 inline">Danh sách Phản biện</h2>
            <span className="text-sm text-gray-500 ml-2">({reviewers.length} người)</span>
          </div>
        </div>

        {reviewers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có phản biện nào được phân công</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewers.map((reviewer) => (
              <div
                key={reviewer.reviewerId}
                className="relative p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                {/* Badge số bài báo */}
                <div className="absolute top-3 right-3">
                  <div className="bg-transparent border border-gray-500 text-black text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {reviewer.assignedPaperCount} bài
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 pr-20">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-lg font-semibold">
                        {reviewer.reviewerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base">{reviewer.reviewerName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="truncate">#{reviewer.reviewerId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Paper Count as Avatar Group */}
                  <div className="absolute bottom-3 right-3 flex items-center">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(reviewer.assignedPaperCount, 5) }, (_, i) => {
                        const colors = [
                          "bg-gradient-to-br from-cyan-400 to-cyan-600",
                          "bg-gradient-to-br from-indigo-400 to-indigo-600",
                          "bg-gradient-to-br from-violet-400 to-violet-600",
                          "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600",
                          "bg-gradient-to-br from-amber-400 to-amber-600",
                        ];
                        return (
                          <Avatar key={i} className="w-6 h-6 ring-1 ring-white">
                            <AvatarFallback
                              className={`${colors[i % colors.length]} text-white text-xs font-semibold`}
                            >
                              {i + 1}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {reviewer.assignedPaperCount > 5 && (
                        <Avatar className="w-8 h-8 ring-2 ring-white">
                          <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-semibold">
                            +{reviewer.assignedPaperCount - 5}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
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