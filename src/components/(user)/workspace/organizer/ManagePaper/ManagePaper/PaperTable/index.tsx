"use client";

import React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable";
import { ActionButton } from "@/components/atoms/ActionButton";
import { UnassignAbstract } from "@/types/paper.type";
import { Eye, Trash2 } from "lucide-react";

interface PaperTableProps {
  papers: UnassignAbstract[];
  onView?: (paper: UnassignAbstract) => void;
}

export function PaperTable({
  papers,
  onView,
}: PaperTableProps) {
  const columns: Column<UnassignAbstract>[] = [
    {
      key: "paperId",
      header: "Mã bài báo",
      render: (paper) => (
        <span className="text-sm text-gray-700">{paper.paperId}</span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (paper) => (
        <div className="flex items-center justify-end gap-2">
          {onView && (
            <ActionButton
              onClick={() => onView(paper)}
              icon={<Eye className="w-4 h-4" />}
              variant="primary"
              tooltip="Xem chi tiết"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={papers}
      keyExtractor={(paper) => paper.paperId}
      emptyMessage="Không tìm thấy bài báo nào"
    />
  );
}
