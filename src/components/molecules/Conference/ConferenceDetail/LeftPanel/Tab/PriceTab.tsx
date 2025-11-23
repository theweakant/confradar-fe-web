"use client";

import { formatCurrency } from "@/helper/format";
import type {
  ConferencePriceResponse,
  ConferencePricePhaseResponse,
} from "@/types/conference.type";
import type { CommonConference } from "@/types/conference.type"; 

interface PriceTabProps {
  conference: CommonConference;
}

export function PriceTab({ conference }: PriceTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Giá Vé</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin chi tiết về giá vé và các đợt bán vé
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
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {price.ticketName}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      #{price.conferencePriceId}
                    </span>
                    {price.isAuthor && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold border border-yellow-200 dark:border-yellow-800">
                        AUTHOR
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
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(price.ticketPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <InfoField label="Tổng Slot" value={price.totalSlot} />
                <InfoField label="Slot Còn Lại" value={price.availableSlot} />
                <InfoField
                  label="Dành cho Tác Giả"
                  value={price.isAuthor ? "Có" : "Không"}
                />
              </div>

              {price.pricePhases && price.pricePhases.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                    Các Đợt Bán Hàng
                  </h4>
                  {/* Grid 3 phase / row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {price.pricePhases.map(
                      (phase: ConferencePricePhaseResponse) => (
                        <div
                          key={phase.phaseName}
                          className="bg-background border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors text-xs md:text-sm flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {phase.phaseName}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                -{phase.applyPercent}%
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-border pt-2 space-y-1 text-[11px] md:text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Thời Gian</span>
                              <span className="font-medium">{`${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Áp dụng</span>
                              <span className="font-medium">{phase.applyPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tổng Slot</span>
                              <span className="font-medium">{phase.totalSlot}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Còn Lại</span>
                              <span className="font-medium">{phase.availableSlot}</span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có thông tin giá vé</p>
        </div>
      )}
    </div>
  );
}

// --- Reusable Helper Component (nội bộ) ---
interface InfoFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900 font-semibold break-words">
        {value != null && value !== "" ? String(value) : "N/A"}
      </p>
    </div>
  );
}

// Helper để tránh import từ nơi khác (nếu chưa có)
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("vi-VN");
}