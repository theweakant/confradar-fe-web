"use client";

import React from "react";
import { Eye, MoreVertical } from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { AssignedPaper } from "@/types/paper.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaperTableProps {
  papers: AssignedPaper[];
  onView?: (paper: AssignedPaper) => void;
}

export function PaperTable({ papers, onView }: PaperTableProps) {
  const columns: Column<AssignedPaper>[] = [
    {
      key: "paperId",
      header: "Paper ID",
      render: (paper) => (
        <div className="font-mono text-sm text-gray-900">
          {paper.paperId}
        </div>
      ),
    },
    {
      key: "presenterId",
      header: "Presenter ID",
      render: (paper) => (
        <div className="font-mono text-sm text-gray-600">
          {paper.presenterId}
        </div>
      ),
    },
    {
      key: "conferenceId",
      header: "Conference ID",
      render: (paper) => (
        <div className="font-mono text-sm text-gray-600">
          {paper.conferenceId}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      className: "text-right",
      render: (paper) => (
        <div className="flex items-center justify-end">
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