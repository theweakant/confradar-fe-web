"use client";

import React from "react";
import { 
  Calendar,
  Users,
  MapPin,
  Eye,
  UserPlus,
  Trash2,
} from "lucide-react";

import { DataTable, Column } from "@/components/molecules/DataTable";
import { formatDate } from "@/helper/format";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ActionButton } from "@/components/atoms/ActionButton";
import { Paper } from "@/types/paper.type";
import { truncateContent } from "@/helper/format";

interface PaperTableProps {
  papers: Paper[];
  onView?: (paper: Paper) => void;
  onAssignReviewer?: (paper: Paper) => void;
  onDelete?: (id: string) => void;
}

export function PaperTable({ 
  papers,
  onView,
  onAssignReviewer,
  onDelete,
}: PaperTableProps) {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: "Đã nộp",
      under_review: "Đang đánh giá",
      revision_required: "Yêu cầu sửa",
      accepted: "Chấp nhận",
      rejected: "Từ chối",
      withdrawn: "Đã rút"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      submitted: "info",
      under_review: "warning",
      revision_required: "warning",
      accepted: "success",
      rejected: "danger",
      withdrawn: "info"
    };
    return variants[status] || "info";
  };

  const getPaperTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_paper: "Full Paper",
      short_paper: "Short Paper",
      poster: "Poster",
      workshop: "Workshop"
    };
    return labels[type] || type;
  };

  const columns: Column<Paper>[] = [
    {
      key: "title",
      header: "Tiêu đề bài báo",
      render: (paper) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900 line-clamp-2">
            {truncateContent(paper.title, 30)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 truncate">
              {paper.authors.join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
              {getPaperTypeLabel(paper.paperType)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "conference",
      header: "Hội thảo & Track",
      render: (paper) => (
        <div className="min-w-[180px]">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 truncate">
              {truncateContent(paper.conferenceName, 30)}
            </span>
          </div>
          <p className="text-xs text-gray-500 ml-6 truncate">
            {paper.trackName}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (paper) => (
        <StatusBadge
          status={getStatusLabel(paper.status)}
          variant={getStatusVariant(paper.status)}
        />
      ),
    },
    {
      key: "review",
      header: "Đánh giá",
      render: (paper) => (
        <div className="min-w-[120px]">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {paper.reviewCount} / {paper.reviewers.length}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "submitter",
      header: "Người nộp",
      render: (paper) => (
        <div className="min-w-[150px]">
          <p className="text-sm font-medium text-gray-900">
            {paper.submitterName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {paper.submitterEmail}
          </p>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Ngày nộp",
      render: (paper) => (
        <div className="min-w-[110px]">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(paper.submissionDate)}</span>
          </div>
          {paper.submissionDate !== paper.lastModifiedDate && (
            <p className="text-xs text-gray-500 ml-6">
              Sửa lần cuối: {formatDate(paper.lastModifiedDate)}
            </p>
          )}
        </div>
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
              variant="info"
              tooltip="Xem chi tiết"
            />
          )}
          {onAssignReviewer && (
            <ActionButton
              onClick={() => onAssignReviewer(paper)}
              icon={<UserPlus className="w-4 h-4" />}
              variant="success"
              tooltip="Giao reviewer"
            />
          )}
          {onDelete && (
            <ActionButton
              onClick={() => onDelete(paper.id)}
              icon={<Trash2 className="w-4 h-4" />}
              variant="danger"
              tooltip="Xóa"
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
      keyExtractor={(paper) => paper.id}
      emptyMessage="Không tìm thấy bài báo nào"
    />
  );
}