"use client";

import {
  FileText,
  Users,
  Calendar,
  MapPin,
  Tag,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/helper/format";
import { Paper } from "@/types/paper.type";

interface PaperDetailProps {
  paper: Paper;
  onClose: () => void;
}

export function PaperDetail({ paper, onClose }: PaperDetailProps) {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_paper: "Full Paper",
      short_paper: "Short Paper",
      poster: "Poster",
      workshop: "Workshop",
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: "Đã nộp",
      under_review: "Đang đánh giá",
      revision_required: "Yêu cầu sửa",
      accepted: "Chấp nhận",
      rejected: "Từ chối",
      withdrawn: "Đã rút",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-700",
      under_review: "bg-yellow-100 text-yellow-700",
      revision_required: "bg-orange-100 text-orange-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      withdrawn: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {paper.title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(paper.status)}`}>
              {getStatusLabel(paper.status)}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {getTypeLabel(paper.paperType)}
            </span>
          </div>
        </div>
      </div>

      {/* Conference & Track Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Hội thảo</p>
            <p className="text-gray-900">{paper.conferenceName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Track</p>
            <p className="text-gray-900">{paper.trackName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Ngày nộp</p>
            <p className="text-gray-900">{formatDate(paper.submissionDate)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Sửa lần cuối</p>
            <p className="text-gray-900">{formatDate(paper.lastModifiedDate)}</p>
          </div>
        </div>
      </div>

      {/* Submitter Info */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Thông tin người nộp
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Họ tên</p>
            <p className="text-gray-900">{paper.submitterName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-gray-900">{paper.submitterEmail}</p>
          </div>
        </div>
      </div>

      {/* Paper Content */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Tác giả</p>
            <p className="text-gray-900">{paper.authors.join(", ")}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Tóm tắt</p>
            <p className="text-gray-900 leading-relaxed">{paper.abstract}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Từ khóa</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {paper.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {paper.fileUrl && (
          <div className="flex items-start gap-3">
            <Paperclip className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                File đính kèm
              </p>
              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {paper.fileUrl}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Review Status */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          Trạng thái đánh giá
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Số reviewer được giao</p>
            <p className="text-2xl font-bold text-gray-900">{paper.reviewers.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Số đánh giá hoàn thành</p>
            <p className="text-2xl font-bold text-gray-900">{paper.reviewCount}</p>
          </div>
          {paper.averageScore && (
            <div>
              <p className="text-sm font-medium text-gray-700">Điểm trung bình</p>
              <p className="text-2xl font-bold text-gray-900">{paper.averageScore.toFixed(1)}/10</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {paper.comments && (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Ghi chú đánh giá
              </p>
              <p className="text-gray-900">{paper.comments}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}