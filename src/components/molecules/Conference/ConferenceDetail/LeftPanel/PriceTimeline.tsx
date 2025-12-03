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
  isResearch: boolean;
}

export function PriceTimeline({ conference, isResearch }: PriceTimelineProps) {
  if (!conference.conferencePrices) return null;

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

  const authorTicket = timelines.find(t => t.isAuthor);
  const normalTicket = timelines.find(t => !t.isAuthor);

  const finalTimelines = [];
  if (normalTicket) finalTimelines.push(normalTicket);
  if (authorTicket) finalTimelines.push(authorTicket);

  const getNearestPhase = (phases: PhaseItem[]) => {
    if (phases.length === 0) return null;

    const now = new Date();
    const sortedPhases = [...phases].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const ongoingPhase = sortedPhases.find(phase => {
      const start = new Date(phase.startDate);
      const end = new Date(phase.endDate);
      return now >= start && now <= end;
    });

    if (ongoingPhase) return ongoingPhase;

    const upcomingPhase = sortedPhases.find(phase => new Date(phase.startDate) > now);
    return upcomingPhase || sortedPhases[sortedPhases.length - 1];
  };

  const calculateProgress = (phase: PhaseItem) => {
    const now = new Date();
    const start = new Date(phase.startDate);
    const end = new Date(phase.endDate);

    if (now < start) return 0;
    if (now > end) return 100;

    const totalTime = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    if (totalTime <= 0) return 100;

    return Math.round(Math.max(0, Math.min(100, (elapsed / totalTime) * 100)));
  };

  const ticketData = finalTimelines
    .map(ticket => ({
      ...ticket,
      nearestPhase: getNearestPhase(ticket.phases),
    }))
    .filter(t => t.nearestPhase !== null);

  if (ticketData.length === 0) return null;

  const hasMultipleTickets = ticketData.length > 1;
  const now = new Date();

  return (
    <div className="border-t pt-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {isResearch
          ? "Giai đoạn đăng ký cho thính giả & tác giả"
          : "Giai đoạn mở bán vé"}
      </h3>

      <div className={hasMultipleTickets ? "grid grid-cols-2 gap-4" : ""}>
        {ticketData.map((ticket, idx) => {
          const phase = ticket.nearestPhase!;
          const start = new Date(phase.startDate);
          const end = new Date(phase.endDate);
          const progress = calculateProgress(phase);

          let statusText = "";
          let statusColor = "text-gray-600";

          if (now < start) {
            statusText = `Sẽ bắt đầu ${formatDate(phase.startDate)}`;
            statusColor = "text-gray-600";
          } else if (now > end) {
            statusText = "Đã kết thúc";
            statusColor = "text-red-600";
          } else {
            const remainingPercent = Math.round(100 - progress);
            statusText = `Còn ${remainingPercent}% thời gian`;
            statusColor = progress < 50 ? "text-emerald-600" :
                         progress < 80 ? "text-blue-600" :
                         "text-orange-600";
          }

          return (
            <div key={idx} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ticket.isAuthor ? "bg-blue-500" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-xs font-semibold text-gray-900">
                    {ticket.ticketName}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {phase.phaseName}
                </span>
              </div>

              <div className="relative">
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  {now >= start && (
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  )}
                  {now >= start && now <= end && progress < 100 && (
                    <div
                      className="absolute top-0 h-full bg-emerald-400 rounded-full"
                      style={{
                        left: `${Math.min(progress, 100)}%`,
                        width: `${Math.min(10, 100 - progress)}%`,
                        backgroundImage:
                          'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)',
                      }}
                    />
                  )}
                </div>

                {now >= start && (
                  <div
                    className="absolute -top-1 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md transform -translate-x-1/2"
                    style={{ left: `${Math.min(progress, 100)}%` }}
                  />
                )}
              </div>

              <p className="text-xs text-gray-700">
                <span className={`font-semibold ${statusColor}`}>
                  {statusText}
                </span>
                {now >= start && now <= end && (
                  <>
                    {" "}và kết thúc vào{" "}
                    <span className="font-semibold text-gray-900">
                      {formatDate(phase.endDate)}
                    </span>
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}