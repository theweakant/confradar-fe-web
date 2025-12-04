"use client";

import { FileText, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PaperDetail } from "@/types/statistics.type";

interface PaperListProps {
  papers: PaperDetail[];
  onPaperClick: (paperId: string) => void;
}

const phaseStyles: Record<string, { bg: string; text: string }> = {
  Abstract: { bg: "bg-blue-100", text: "text-blue-800" },
  FullPaper: { bg: "bg-emerald-100", text: "text-emerald-800" },
  Revision: { bg: "bg-amber-100", text: "text-amber-800" },
  CameraReady: { bg: "bg-purple-100", text: "text-purple-800" },
  default: { bg: "bg-gray-100", text: "text-gray-800" },
};

export function PaperList({ papers, onPaperClick }: PaperListProps) {
  return (
    <section className="bg-white rounded-xl p-2">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 inline">
            Bài báo đã nộp
          </h2>
          <span className="text-sm text-gray-500 ml-2">
            ({papers.length} bài báo)
          </span>
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
              onClick={() => onPaperClick(paper.paperId)}
              className="group p-5 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/30 hover:shadow-md transition-all duration-200 bg-white cursor-pointer"
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

                <div className="flex-[2]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex -space-x-2">
                      {paper.assignedReviewers && paper.assignedReviewers.length > 0 ? (
                        <>
                          {paper.assignedReviewers.slice(0, 3).map((reviewer, idx) => (
                            <Avatar key={reviewer.userId} className="w-8 h-8 ring-2 ring-white">
                              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-xs font-medium">
                                {reviewer.name.charAt(0).toUpperCase()}
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

                <div className="flex-[2]">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Tiến độ</div>
                    <div className="flex gap-1 justify-center">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          ["Abstract", "FullPaper", "Revision", "CameraReady"].includes(
                            paper.paperPhase
                          )
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
  );
}