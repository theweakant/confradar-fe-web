// components/LeftPanel/MetaInfoSection.tsx
import { MapPin } from "lucide-react";
import { formatDate } from "@/helper/format";
import type {
  CommonConference,
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
  ResearchConferenceSessionResponse,
  TechnicalConferenceSessionResponse,
} from "@/types/conference.type";
import { PriceTimeline } from "./PriceTimeline";
import { ResearchPhaseTimeline } from "./ResearchTimeline";

interface MetaInfoSectionProps {
  conference: CommonConference;
  getCategoryName: (id: string) => string;
  getStatusName: (id: string) => string;
  getCityName: (id: string) => string;
  isOrganizer: boolean;
  isCollaborator: boolean;
  now: Date; 
}

type ConferenceSession =
  | ResearchConferenceSessionResponse
  | TechnicalConferenceSessionResponse;

type SessionWithDays = ConferenceSession & {
  days: number | null;
};

function isResearchConference(
  conference: CommonConference
): conference is ResearchConferenceDetailResponse {
  return conference.isResearchConference === true;
}

function isTechnicalConference(
  conference: CommonConference
): conference is TechnicalConferenceDetailResponse {
  return !conference.isResearchConference;
}

function isTechnicalSession(
  session: ConferenceSession
): session is TechnicalConferenceSessionResponse {
  return 'sessionDate' in session;
}

function getDaysRemaining(targetDate: string | undefined | null, now: Date) {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatCountdown(days: number | null) {
  if (days === null) return "";
  if (days < 0) return "Đã qua";
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
}

function getNextPricePhase(conference: CommonConference, now: Date) {
  if (!conference.conferencePrices) return null;

  let nearestPhase = null;
  let nearestDays = Infinity;

  for (const price of conference.conferencePrices) {
    if (price.pricePhases) {
      for (const phase of price.pricePhases) {
        if (phase.endDate) {
          const endDate = new Date(phase.endDate);
          if (endDate >= now) {
            const days = getDaysRemaining(phase.endDate, now);
            if (days !== null && days < nearestDays) {
              nearestDays = days;
              nearestPhase = {
                ...phase,
                ticketName: price.ticketName,
                days,
              };
            }
          }
        }
      }
    }
  }

  return nearestPhase;
}

function getNextSession(conference: CommonConference, now: Date): SessionWithDays | null {
  let sessions: ConferenceSession[] | undefined;

  if (isResearchConference(conference)) {
    sessions = conference.researchSessions;
  } else if (isTechnicalConference(conference)) {
    sessions = conference.sessions;
  }

  if (!sessions?.length) return null;

  let nearestSession: SessionWithDays | null = null;
  let nearestTime = Infinity;

  for (const session of sessions) {
    const sessionDate = session.date || (isTechnicalSession(session) ? session.sessionDate : undefined);
    const startTime = session.startTime;

    if (sessionDate && startTime) {
      const sessionDateTime = new Date(`${sessionDate} ${startTime}`);
      if (sessionDateTime >= now) {
        const diff = sessionDateTime.getTime() - now.getTime();
        if (diff < nearestTime) {
          nearestTime = diff;
          nearestSession = {
            ...session,
            days: getDaysRemaining(`${sessionDate} ${startTime}`, now),
          };
        }
      }
    }
  }

  return nearestSession;
}

function getNextResearchDeadline(conference: CommonConference, now: Date) {
  if (!isResearchConference(conference) || !conference.researchPhase) {
    return null;
  }

  const activePhase = conference.researchPhase.find(phase => phase.isActive);
  if (!activePhase) return null;

  const deadlines = [
    { name: "Đăng ký", end: activePhase.registrationEndDate },
    { name: "Full Paper", end: activePhase.fullPaperEndDate },
    { name: "Review", end: activePhase.reviewEndDate },
    { name: "Revise", end: activePhase.reviseEndDate },
    { name: "Camera Ready", end: activePhase.cameraReadyEndDate },
  ];

  let nearest: { name: string; date: string; days: number } | null = null;

  for (const deadline of deadlines) {
    if (deadline.end) {
      const endDate = new Date(deadline.end);
      if (endDate >= now) {
        const days = getDaysRemaining(deadline.end, now);
        if (days !== null && (!nearest || days < nearest.days)) {
          nearest = { name: deadline.name, date: deadline.end, days };
        }
      }
    }
  }

  return nearest;
}

interface ResearchPhaseItem {
  name: string;
  startDate: string;
  endDate: string;
}

export function MetaInfoSection({
  conference,
  getCategoryName,
  getStatusName,
  getCityName,
  isOrganizer,
  isCollaborator,
  now, 
}: MetaInfoSectionProps) {
  const isResearch = isResearchConference(conference);
  const nextPricePhase = getNextPricePhase(conference, now);
  const nextSession = getNextSession(conference, now);
  const nextResearchDeadline = isResearch
    ? getNextResearchDeadline(conference, now)
    : null;

  const activePhase = isResearch
    ? conference.researchPhase?.find((p) => p.isActive === true)
    : null;

  const researchPhases: ResearchPhaseItem[] = [];

  if (activePhase) {
    const phaseMap = [
      { label: "Đăng ký bài báo", startDate: activePhase.registrationStartDate, endDate: activePhase.registrationEndDate },
      { label: "Full Paper", startDate: activePhase.fullPaperStartDate, endDate: activePhase.fullPaperEndDate },
      { label: "Review", startDate: activePhase.reviewStartDate, endDate: activePhase.reviewEndDate },
      { label: "Revise", startDate: activePhase.reviseStartDate, endDate: activePhase.reviseEndDate },
      { label: "Camera Ready", startDate: activePhase.cameraReadyStartDate, endDate: activePhase.cameraReadyEndDate },
    ];

    for (const { label, startDate, endDate } of phaseMap) {
      if (startDate && endDate) {
        researchPhases.push({ name: label, startDate, endDate });
      }
    }
  }

  const startDateDays = getDaysRemaining(conference.startDate, now);
  const ticketSaleEndDays = getDaysRemaining(conference.ticketSaleEnd, now);
  const safeBannerUrl = conference.bannerImageUrl?.trim() || "";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-2xl font-medium text-gray-900">
            {conference.conferenceName}
          </h1>
          {conference.conferenceId && (
            <span className="text-xs text-gray-400 font-mono">
              #{conference.conferenceId}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {conference.description ||
            "Hệ thống thiết kế trong phiên bản web hiện tại cần cải thiện và bổ sung thêm một số thành phần khác."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0">Danh mục</span>
            <span className="text-xs text-blue-600 font-medium">
              {getCategoryName(conference.conferenceCategoryId ?? "")}
            </span>
          </div>

          {startDateDays !== null && startDateDays >= 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Thời gian</span>
              <span className="text-xs text-gray-900 font-medium whitespace-nowrap">
                {formatDate(conference.startDate)} → {formatDate(conference.endDate)}
              </span>
            </div>
          )}

          {ticketSaleEndDays !== null && ticketSaleEndDays >= 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Ngày bán</span>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-900 font-medium whitespace-nowrap">
                  {formatDate(conference.ticketSaleStart)} → {formatDate(conference.ticketSaleEnd)}
                </span>
                <span className="text-[10px] text-orange-600 font-medium">
                  ({formatCountdown(ticketSaleEndDays)})
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0">Thành phố</span>
            <span className="text-xs text-gray-900 font-medium">
              {getCityName(conference.cityId ?? "")}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0">Số lượng tham dự</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-900 font-bold">
                {conference.availableSlot}
              </span>
              <span className="text-xs text-gray-500">
                / {conference.totalSlot} chỗ
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0">Loại hình</span>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                  conference.isInternalHosted
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {conference.isInternalHosted ? "ConfRadar" : "Đối tác"}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                  conference.isResearchConference
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {conference.isResearchConference ? "Nghiên cứu" : "Kỹ thuật"}
              </span>
            </div>
          </div>

          {nextPricePhase && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Giai đoạn</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-900 font-medium">
                  {nextPricePhase.phaseName}
                </span>
                <span className="text-[10px] text-orange-600 font-medium">
                  ({formatCountdown(nextPricePhase.days)})
                </span>
              </div>
            </div>
          )}

          {nextSession && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Session</span>
              <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-900 font-medium">
                    {nextSession.title}
                  </span>
                  <span className="text-[10px] text-orange-600 font-medium">
                    ({formatCountdown(nextSession.days)})
                  </span>
                </div>
                {nextSession.room?.displayName && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {nextSession.room.displayName}
                  </span>
                )}
              </div>
            </div>
          )}

          {isResearch && nextResearchDeadline && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Research Phase</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-900 font-medium">
                  {nextResearchDeadline.name}
                </span>
                <span className="text-[10px] text-orange-600 font-medium">
                  ({formatCountdown(nextResearchDeadline.days)})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          {safeBannerUrl ? (
            <div className="aspect-video rounded-lg overflow-hidden shadow-md">
              <img
                src={safeBannerUrl}
                alt={`${conference.conferenceName} banner`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-banner.png";
                }}
              />
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Chưa có ảnh banner</span>
            </div>
          )}
        </div>
      </div>

      {(isOrganizer || isCollaborator) && (
        <PriceTimeline
          conference={conference}
          isResearch={isResearchConference(conference)}
          now={now} 
        />
      )}
      
      {isResearch && isOrganizer && researchPhases.length > 0 && (
        <div className="border-t pt-6">
          <ResearchPhaseTimeline phases={researchPhases} now={now} /> 
        </div>
      )}
    </div>
  );
}