
"use client";

import { Button } from "@/components/ui/button";
import { Clock, UserCheck, MessageCircle, FileText, PackageCheck, Edit3 } from "lucide-react";
import { formatCurrency } from "@/helper/format";
import type { ResearchConferencePhaseResponse, ConferencePriceResponse } from "@/types/conference.type";

interface ActivatePhaseConfirmProps {
  phase: ResearchConferencePhaseResponse;
  currentActivePhase: ResearchConferencePhaseResponse;
  authorPrices?: ConferencePriceResponse[]; 
  onConfirm: () => Promise<void>;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatRange = (start: string, end: string): string => {
  return `${formatDate(start)} – ${formatDate(end)}`;
};

const getTimelineSteps = (phase: ResearchConferencePhaseResponse) => [
  {
    title: "Đăng ký tham dự",
    start: phase.registrationStartDate,
    end: phase.registrationEndDate,
    icon: UserCheck,
    color: "text-blue-600",
  },
  {
    title: "Quyết định Abstract",
    start: phase.abstractDecideStatusStart,
    end: phase.abstractDecideStatusEnd,
    icon: MessageCircle,
    color: "text-amber-600",
  },
  {
    title: "Gửi Full Paper",
    start: phase.fullPaperStartDate,
    end: phase.fullPaperEndDate,
    icon: FileText,
    color: "text-emerald-600",
  },
  {
    title: "Review",
    start: phase.reviewStartDate,
    end: phase.reviewEndDate,
    icon: MessageCircle,
    color: "text-violet-600",
  },
  {
    title: "Quyết định Full Paper",
    start: phase.fullPaperDecideStatusStart,
    end: phase.fullPaperDecideStatusEnd,
    icon: PackageCheck,
    color: "text-indigo-600",
  },
  {
    title: "Chỉnh sửa & gửi lại",
    start: phase.reviseStartDate,
    end: phase.reviseEndDate,
    icon: Edit3,
    color: "text-orange-600",
  },
  {
    title: "Quyết định Paper Revision",
    start: phase.revisionPaperDecideStatusStart,
    end: phase.revisionPaperDecideStatusEnd,
    icon: PackageCheck,
    color: "text-fuchsia-600",
  },
  {
    title: "Gửi bản Camera Ready",
    start: phase.cameraReadyStartDate,
    end: phase.cameraReadyEndDate,
    icon: FileText,
    color: "text-green-600",
  },
  {
    title: "Quyết định Camera Ready",
    start: phase.cameraReadyDecideStatusStart,
    end: phase.cameraReadyDecideStatusEnd,
    icon: PackageCheck,
    color: "text-teal-600",
  },
  {
    title: "Tác giả thanh toán chi phí",
    start: phase.authorPaymentStart,
    end: phase.authorPaymentEnd,
    icon: PackageCheck,
    color: "text-teal-600",
  },
];

export function ActivatePhaseConfirm({
  phase,
  currentActivePhase,
  authorPrices = [],
  onConfirm,
}: ActivatePhaseConfirmProps) {
  return (
    <div className="space-y-6">
      {/* Warning Alert */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
        <p className="text-sm text-amber-800">
          <strong>⚠️ Lưu ý:</strong> Khi kích hoạt <strong>Phase {phase.phaseOrder}</strong>,{" "}
          <strong>Phase {currentActivePhase.phaseOrder}</strong> sẽ bị <strong>vô hiệu hóa</strong> và không thể đăng ký thêm.
        </p>
      </div>

      {/* Phase Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Xem trước Phase {phase.phaseOrder}</h4>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Chưa kích hoạt
          </span>
        </div>

        <div className="space-y-3">
          {getTimelineSteps(phase).map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-2 rounded-md bg-gray-50"
              >
                <div className={`mt-0.5 p-1 rounded-full ${item.color.replace('text', 'bg').replace('-600', '-100')}`}>
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    <span className="text-xs text-gray-600">
                      {formatRange(item.start || '', item.end || '')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Author Prices Section */}
      {authorPrices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Chi phí áp dụng cho tác giả</h5>
          <ul className="text-sm text-gray-700 space-y-1">
            {authorPrices
              .filter(p => p.isAuthor)
              .map(price => (
                <li key={price.conferencePriceId} className="flex justify-between">
                  <span>{price.ticketName}</span>
                  <span className="font-medium">{formatCurrency(price.ticketPrice)}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Confirm Button */}
      <div className="pt-2">
        <Button
          onClick={onConfirm}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Xác nhận Kích hoạt Phase {phase.phaseOrder}
        </Button>
      </div>
    </div>
  );
}