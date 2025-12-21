"use client";

import { formatCurrency } from "@/helper/format";
import type {
  ConferencePriceResponse,
  ConferencePricePhaseResponse,
} from "@/types/conference.type";
import type { CommonConference } from "@/types/conference.type";
import {  CheckCircle2 } from "lucide-react";

interface PriceTabProps {
  conference: CommonConference;
  now: Date; 
}

export function PriceTab({ conference, now }: PriceTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Chi phí tham dự</h2>
        <p className="text-sm text-muted-foreground mt-3">
          Thông tin chi tiết về chi phí
        </p>
      </div>

      {conference.conferencePrices && conference.conferencePrices.length > 0 ? (
        <div className="space-y-5">
          {conference.conferencePrices.map((price: ConferencePriceResponse) => (
            <div
              key={price.conferencePriceId}
              className="border border-border rounded-lg bg-card p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-6 mb-6 pb-6 border-b border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-2xl font-bold text-foreground">
                      {price.ticketName}
                    </h3>
                    {price.isAuthor && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold border border-yellow-200 dark:border-yellow-800">
                        AUTHOR
                      </span>
                    )}
                    {price.isPublish && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800">
                        {/* <FileText className="w-3.5 h-3.5" /> */}
                        <span>Xuất bản</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {price.ticketDescription}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    Giá
                  </p>
                  <p className="text-2xl font-semibold text-green-700">
                    {formatCurrency(price.ticketPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoField label="Tổng Slot" value={price.totalSlot} />
                <InfoField label="Slot Còn Lại" value={price.availableSlot} />
                <InfoField 
                  label="Xuất bản" 
                  value={
                    <span className="flex items-center gap-1.5">
                      {price.isPublish ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-600 dark:text-green-400">Có</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Không</span>
                      )}
                    </span>
                  }
                />
              </div>

              {price.pricePhases && price.pricePhases.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Các Giai Đoạn
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {price.pricePhases.map(
                      (phase: ConferencePricePhaseResponse) => {
                        const badge = getPhaseBadge(phase.startDate, phase.endDate, now);
                        
                        return (
                          <div
                            key={phase.phaseName}
                            className="bg-background border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors text-xs md:text-sm flex flex-col justify-between min-w-0"
                          >
                            <div className="flex items-center justify-between mb-3 gap-2">
                              <div className="flex items-center gap-2 flex-shrink min-w-0">
                                <span className="font-semibold text-foreground text-sm truncate">
                                  {phase.phaseName}
                                </span>
                              </div>
                              <div className="flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border inline-block whitespace-nowrap ${badge.className}`}>
                                  {badge.text}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-border pt-2 space-y-1 text-[11px]">
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground flex-shrink-0">Thời Gian</span>
                                <span className="font-medium text-right break-words">
                                  {`${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}`}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Áp dụng</span>
                                <span className="font-medium">{phase.applyPercent}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Còn lại</span>
                                <span className="font-medium">
                                  <span className="text-emerald-600 dark:text-emerald-400">{phase.availableSlot}</span>
                                  <span className="text-muted-foreground"> (</span>
                                  <span className="text-blue-600 dark:text-blue-400">{phase.totalSlot}</span>
                                  <span className="text-muted-foreground">)</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có thông tin</p>
        </div>
      )}
    </div>
  );
}

// --- Helper function để tính badge trạng thái ---
function getPhaseBadge(
  startDate?: string,
  endDate?: string,
  now: Date = new Date()
): { text: string; className: string } {
  if (!startDate || !endDate) {
    return {
      text: 'Chưa xác định',
      className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    };
  }

  const nowNormalized = new Date(now);
  nowNormalized.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      text: 'Ngày không hợp lệ',
      className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    };
  }
  
  if (nowNormalized < start) {
    const daysLeft = Math.ceil((start.getTime() - nowNormalized.getTime()) / (1000 * 60 * 60 * 24));
    return {
      text: `Sắp tới (còn ${daysLeft} ngày)`,
      className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    };
  } else if (nowNormalized >= start && nowNormalized <= end) {
    return {
      text: 'Đang diễn ra',
      className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    };
  } else {
    return {
      text: 'Hoàn thành',
      className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    };
  }
}

// --- Reusable Helper Component (nội bộ) ---
interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined | React.ReactNode;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="text-sm text-gray-900 font-semibold break-words">
        {value != null && value !== "" ? (
          typeof value === 'boolean' ? String(value) : value
        ) : "N/A"}
      </div>
    </div>
  );
}

// Helper để định dạng ngày
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN");
}