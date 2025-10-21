"use client";

import {
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Award,
  Building2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { formatDate } from "@/helper/format";
import { ConferenceDetailProps } from "@/types/conference.type";

export function ConferenceDetail({ conference, onClose }: ConferenceDetailProps) {
  const getStatusLabel = (statusId: string) => {
    const labels: Record<string, string> = {
      draft: "Nháp",
      published: "Đã xuất bản",
      open: "Đang mở đăng ký",
      closed: "Đã đóng đăng ký",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã hủy",
    };
    return labels[statusId] || statusId;
  };

  const getStatusVariant = (
    statusId: string
  ): "success" | "danger" | "warning" | "info" => {
    const variants: Record<string, "success" | "danger" | "warning" | "info"> = {
      draft: "warning",
      published: "info",
      open: "success",
      closed: "warning",
      ongoing: "success",
      completed: "info",
      cancelled: "danger",
    };
    return variants[statusId] || "info";
  };

  // Helper: Lấy % tiến độ dựa trên progressStatus
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "Pending":
        return 33.33;
      case "Approved":
        return 66.66;
      case "Published":
        return 100;
      default:
        return 0;
    }
  };

  const progress = getProgressPercentage(conference.progressStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {conference.conferenceName}
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge
              status={getStatusLabel(conference.globalStatusId)}
              variant={getStatusVariant(conference.globalStatusId)}
            />
            {conference.isInternalHosted && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Nội bộ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Banner */}
      {conference.bannerImageUrl && (
        <div className="rounded-lg overflow-hidden relative h-64 w-full">
          <Image
            src={conference.bannerImageUrl}
            alt={conference.conferenceName}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Description */}
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">{conference.description}</p>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Thời gian</p>
              <p className="text-gray-900">{formatDate(conference.startDate)}</p>
              <p className="text-gray-600 text-sm">
                đến {formatDate(conference.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Địa điểm</p>
              <p className="text-gray-900">{conference.address}</p>
              <p className="text-gray-600 text-sm">
                Location ID: {conference.locationId}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Sức chứa</p>
              <p className="text-gray-900">{conference.capacity} người</p>
            </div>
          </div>

          {/* Progress Status */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="w-full">
              <p className="text-sm font-medium text-gray-700">Trạng thái xử lý</p>

              {conference.progressStatus === "Rejected" ? (
                <span className="inline-block mt-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  Rejected
                </span>
              ) : (
                <div className="w-full mt-2">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-3 transition-all duration-500 rounded-full ${
                        progress === 33.33
                          ? "bg-yellow-400"
                          : progress === 66.66
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {conference.progressStatus}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Ranking</p>
              <p className="text-gray-900 font-semibold">
                {conference.conferenceRankingId}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Loại hội thảo</p>
              <p className="text-gray-900">{conference.conferenceTypeId}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Danh mục</p>
              <p className="text-gray-900">{conference.conferenceCategoryId}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Người tổ chức</p>
              <p className="text-gray-900">ID: {conference.userId}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Ngày tạo</p>
              <p className="text-gray-900">{formatDate(conference.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
