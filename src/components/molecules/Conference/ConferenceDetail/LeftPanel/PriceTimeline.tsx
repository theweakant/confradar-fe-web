// components/LeftPanel/PriceTimeline.tsx
import { formatDate } from "@/helper/format";
import type { CommonConference } from "@/types/conference.type";

interface PhaseItem {
  phaseName: string;
  startDate: string;
  endDate: string;
  totalSlot: number;
  availableSlot: number;
}

interface TicketTimeline {
  ticketName: string;
  isAuthor: boolean;
  phases: PhaseItem[];
}

interface PriceTimelineProps {
  conference: CommonConference;
}

export function PriceTimeline({ conference }: PriceTimelineProps) {
  if (!conference.conferencePrices) return null;

  // NHÓM THEO ticket — đảm bảo tất cả field đều non-nullable
  const timelines: TicketTimeline[] = conference.conferencePrices
    .filter(price => price.ticketName != null)
    .map(price => ({
      ticketName: price.ticketName ?? "Vé chưa đặt tên",
      isAuthor: price.isAuthor ?? false,
      phases:
        price.pricePhases
          ?.map(ph => ({
            phaseName: ph.phaseName ?? "Giai đoạn chưa đặt tên",
            startDate: ph.startDate ?? "",
            endDate: ph.endDate || ph.startDate || "",
            totalSlot: ph.totalSlot ?? 0,
            availableSlot: ph.availableSlot ?? 0,
          }))
          .filter(p => p.startDate && p.endDate) ?? [],
    }));

  // TÁCH: author và normal
  const authorTicket = timelines.find(t => t.isAuthor);
  const normalTicket = timelines.find(t => !t.isAuthor);

  const finalTimelines = [];
  if (normalTicket) finalTimelines.push(normalTicket);
  if (authorTicket) finalTimelines.push(authorTicket);

  return (
    <div className="border-t pt-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Giai đoạn các loại chi phí
      </h3>

      <div className="space-y-6">
        {finalTimelines.map((ticket, idx) => {
          if (ticket.phases.length === 0) return null;

          // Sắp xếp phase theo ngày bắt đầu
          const sortedPhases = [...ticket.phases].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );

          // Tính tổng thời gian từ phase đầu đến cuối
          const firstStart = new Date(sortedPhases[0].startDate);
          const lastEnd = new Date(sortedPhases[sortedPhases.length - 1].endDate);
          const totalTime = Math.max(1, lastEnd.getTime() - firstStart.getTime());

          // Lấy thời điểm hiện tại
          const now = new Date();

          // Tính % hiện tại so với toàn bộ timeline
          const currentProgress = Math.min(
            100,
            Math.max(0, ((now.getTime() - firstStart.getTime()) / totalTime) * 100)
          );

          // Tính vị trí % cho từng phase
          const phasePositions = sortedPhases.map((phase, i) => {
            const start = new Date(phase.startDate);
            const end = new Date(phase.endDate);
            const startPct = ((start.getTime() - firstStart.getTime()) / totalTime) * 100;
            const endPct = ((end.getTime() - firstStart.getTime()) / totalTime) * 100;
            return {
              ...phase,
              startPct,
              endPct,
            };
          });

          // Chọn màu cho từng phase (có thể tùy chỉnh theo ý bạn)
          const phaseColors = [
            "#E5F2FF", // A+
            "#CCE5FF", // A
            "#B3D9FF", // B
            "#99CCFF", // C
            "#80BFFF", // D
            "#66B2FF", // F
          ];

          return (
            <div key={idx} className="space-y-3">
              {/* Ticket title */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    ticket.isAuthor ? "bg-blue-500" : "bg-yellow-500"
                  }`}
                />
                <span className="text-xs font-medium text-gray-900">
                  {ticket.ticketName}
                </span>
              </div>

              {/* PROGRESS BAR - TIMELINE DẠNG PHÂN ĐOẠN */}
              <div className="relative h-8 flex items-center">
                {/* Thanh nền */}
                <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden">
                  {/* Các đoạn phase */}
                  {phasePositions.map((phase, i) => {
                    const width = phase.endPct - phase.startPct;
                    const left = phase.startPct;
                    const color = phaseColors[i % phaseColors.length];

                    return (
                      <div
                        key={i}
                        className="absolute h-full rounded-full"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: color,
                          transition: "all 0.3s ease",
                        }}
                      />
                    );
                  })}

                  {/* Mũi tên chỉ thời điểm hiện tại */}
                  <div
                    className="absolute top-0 w-3 h-3 bg-black rounded-full border-2 border-white shadow-md transform -translate-y-0.5 z-10"
                    style={{
                      left: `${currentProgress}%`,
                      marginLeft: "-6px",
                    }}
                  />

                  {/* Đường kẻ đứt nét từ mũi tên xuống dưới (nếu cần) */}
                  <div
                    className="absolute top-4 w-[1px] h-4 bg-gray-400 dashed"
                    style={{
                      left: `${currentProgress}%`,
                      marginLeft: "-0.5px",
                    }}
                  />
                </div>
              </div>

              {/* Label mốc phase */}
              <div className="flex justify-between text-[10px] text-gray-700 mt-1">
                {phasePositions.map((phase, i) => {
                  const labelPosition = phase.startPct + (phase.endPct - phase.startPct) / 2;
                  return (
                    <div
                      key={i}
                      className="absolute text-xs font-medium text-gray-900 whitespace-nowrap"
                      style={{
                        left: `${labelPosition}%`,
                        transform: "translateX(-50%)",
                        background: phaseColors[i % phaseColors.length],
                        padding: "1px 4px",
                        borderRadius: "4px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      {phase.phaseName}
                    </div>
                  );
                })}
              </div>

              {/* Phần trăm ở dưới cùng */}
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                {phasePositions.map((phase, i) => {
                  return (
                    <div
                      key={i}
                      className="absolute text-[10px] text-gray-500"
                      style={{
                        left: `${phase.endPct}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {Math.round(phase.endPct)}%
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}