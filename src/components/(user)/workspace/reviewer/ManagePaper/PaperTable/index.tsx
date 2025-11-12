"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Eye, MoreVertical } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { AssignedPaper } from "@/types/paper.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { stages4Step } from "@/helper/paper";

interface PaperTableProps {
  papers: AssignedPaper[];
  onView?: (paper: AssignedPaper) => void;
}

export function PaperTable({ papers, onView }: PaperTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (paperId: string) => {
    setExpandedRow((prev) => (prev === paperId ? null : paperId));
  };

  const columns: Column<AssignedPaper>[] = [
    // {
    //   key: "paperId",
    //   header: "Paper ID",
    //   render: (paper) => (
    //     <div className="font-mono text-sm text-gray-900">{paper.paperId}</div>
    //   ),
    // },
    {
      key: "title",
      header: "Title",
      render: (paper) => (
        <div className="font-mono text-sm text-gray-600">
          {paper.title}
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (paper) => (
        <div className="font-mono text-sm text-gray-600">
          {paper.description}
        </div>
      ),
    },
    {
      key: "phaseStatus",
      header: "Trạng thái Phase",
      render: (paper) => {
        const isExpanded = expandedRow === paper.paperId;
        const currentStageIndex = getCurrentStageIndex(paper);
        const currentLabel =
          stages4Step.find((s) => s.id === currentStageIndex)?.label ||
          "Chưa diễn ra";

        return (
          <div className="text-sm">
            {/* Nút toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(paper.paperId);
              }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Ẩn 4 Giai Đoạn
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> {currentLabel}
                </>
              )}
            </button>

            {/* Hiển thị tất cả phase khi expand */}
            {isExpanded && (
              <div className="mt-2 flex flex-col gap-1 pl-5 border-l border-gray-200">
                {stages4Step.map((stage) => {
                  const phaseState = getPhaseState(paper, stage.id);
                  const color =
                    phaseState === "done"
                      ? "text-green-600"
                      : phaseState === "current"
                        ? "text-blue-600"
                        : "text-gray-400";
                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-2 ${color}`}
                    >
                      <span className="text-xs font-semibold w-24">
                        {stage.label}
                      </span>
                      <span className="text-xs italic">
                        {phaseState === "done"
                          ? "Đã hoàn thành"
                          : phaseState === "current"
                            ? "Đang diễn ra"
                            : "Chưa diễn ra"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      },
    },
    // {
    //   key: "actions",
    //   header: "Hành động",
    //   className: "text-right",
    //   render: (paper) => (
    //     <div className="flex items-center justify-end">
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
    //             <MoreVertical className="w-5 h-5 text-gray-600" />
    //           </button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end" className="w-44">
    //           <DropdownMenuItem
    //             onClick={() => onView?.(paper)}
    //             className="cursor-pointer"
    //           >
    //             <Eye className="w-4 h-4 mr-2 text-green-600" />
    //             <span>Xem chi tiết</span>
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     </div>
    //   ),
    // },
  ];

  return (
    <DataTable
      columns={columns}
      data={papers}
      keyExtractor={(paper) => paper.paperId}
      emptyMessage="Không tìm thấy bài báo nào"
      onRowClick={(paper) => onView?.(paper)}
    />
  );
}

function getCurrentStageIndex(paper: AssignedPaper) {
  const filledIds = stages4Step
    .map((stage) => (paper[stage.key as keyof AssignedPaper] ? stage.id : null))
    .filter((id) => id !== null);
  return filledIds.pop() || null;
}

function getPhaseState(
  paper: AssignedPaper,
  stageId: number
): "not_started" | "current" | "done" {
  const currentStageIndex = getCurrentStageIndex(paper);

  if (!currentStageIndex) {
    return stageId === 1 ? "current" : "not_started";
  }

  if (stageId < currentStageIndex) return "done";
  if (stageId === currentStageIndex) return "current";
  return "not_started";
}


function getPaperPhaseStatus(paper: AssignedPaper) {
  // Tìm phase hiện tại (phase cuối có Id != null)
  const currentStageIndex = stages4Step
    .map((stage) => (paper[stage.key as keyof AssignedPaper] ? stage.id : null))
    .filter((id) => id !== null)
    .pop();

  // Nếu chưa có phase nào bắt đầu
  if (!currentStageIndex) {
    return { label: "Chưa diễn ra", color: "text-gray-500" };
  }

  // Nếu phase hiện tại là stage cuối
  if (currentStageIndex === stages4Step[stages4Step.length - 1].id) {
    return { label: "Đang diễn ra (CameraReady)", color: "text-green-600" };
  }

  // Nếu phase hiện tại < stage cuối và tiếp theo chưa có id
  const nextStage = stages4Step.find((s) => s.id === currentStageIndex + 1);
  const nextHasStarted = nextStage && paper[nextStage.key as keyof AssignedPaper];
  if (!nextHasStarted) {
    const currentLabel =
      stages4Step.find((s) => s.id === currentStageIndex)?.label || "";
    return { label: `Đang diễn ra (${currentLabel})`, color: "text-blue-600" };
  }

  // Nếu tất cả phase đều có Id
  const allStarted = stages4Step.every((s) => paper[s.key as keyof AssignedPaper]);
  if (allStarted) {
    return { label: "Đã kết thúc", color: "text-green-700" };
  }

  // Mặc định
  return { label: "Đang diễn ra", color: "text-blue-600" };
}