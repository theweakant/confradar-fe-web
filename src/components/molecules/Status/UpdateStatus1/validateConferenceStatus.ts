// components/molecules/Status/validateConferenceStatus.ts

import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";

export type Conference = TechnicalConferenceDetailResponse | ResearchConferenceDetailResponse;
export type ConferenceType = "technical" | "research";

export interface ValidationReport {
  valid: boolean;
  missingRequired: string[];
  missingRecommended: string[];
}

export interface TimeValidationReport {
  valid: boolean;
  expiredDates: string[];
  message?: string;
}

/**
 * Validate dữ liệu hội thảo trước khi chuyển trạng thái
 * Dùng cho: Draft → Pending, Preparing → Ready
 */
export const validateConferenceForStatusChange = (
  conference: Conference,
  conferenceType: ConferenceType
): ValidationReport => {
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];

  if (!conference.startDate) missingRequired.push("Ngày bắt đầu");
  if (!conference.endDate) missingRequired.push("Ngày kết thúc");

  if ((conference.conferencePrices?.length || 0) === 0) missingRequired.push("Giá vé");
  if ((conference.policies?.length || 0) === 0) missingRequired.push("Chính sách");
  if ((conference.sponsors?.length || 0) === 0) missingRequired.push("Nhà tài trợ");
  if ((conference.conferenceMedia?.length || 0) === 0) missingRequired.push("Hình ảnh/video");

  if (conferenceType === "technical") {
    const techConf = conference as TechnicalConferenceDetailResponse;
    if ((techConf.sessions?.length || 0) === 0) {
      missingRequired.push("Session");
    }
  } else {
    const researchConf = conference as ResearchConferenceDetailResponse;
    if ((researchConf.researchPhase?.length || 0) === 0) {
      missingRequired.push("Giai đoạn hội thảo");
    }
    if ((researchConf.researchSessions?.length || 0) === 0) {
      missingRequired.push("Lịch trình (sessions)");
    }

    if ((researchConf.rankingReferenceUrls?.length || 0) === 0) {
      missingRecommended.push("Nên thêm Ranking Reference");
    }
  }

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingRecommended,
  };
};

/**
 * Validate thời gian khi chuyển từ OnHold → Ready
 * Kiểm tra xem có mốc thời gian nào đã qua so với ngày OnHold không
 */
export const validateTimelineForOnHoldToReady = (
  conference: Conference,
  conferenceType: ConferenceType
): TimeValidationReport => {
  const now = new Date();
  const expiredDates: string[] = [];

  // Lấy ngày OnHold gần nhất từ conferenceTimelines
  const onHoldDate = conference.conferenceTimelines
    ?.filter((t) => t.afterwardStatusName === "OnHold")
    ?.sort((a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())[0]
    ?.changeDate;

  if (!onHoldDate) {
    return {
      valid: false,
      expiredDates: [],
      message: "Không tìm thấy thông tin ngày chuyển sang OnHold",
    };
  }

  const onHoldDateTime = new Date(onHoldDate);

  // Helper function để kiểm tra ngày
  const checkDate = (date: string | undefined, label: string) => {
    if (date) {
      const dateTime = new Date(date);
      // Nếu ngày này đã set trước khi OnHold, và hiện tại đã qua ngày đó
      if (dateTime < onHoldDateTime && now > dateTime) {
        expiredDates.push(label);
      }
    }
  };

  // === Kiểm tra các ngày chung ===
  checkDate(conference.ticketSaleStart, "Ngày bắt đầu bán vé");
  checkDate(conference.ticketSaleEnd, "Ngày kết thúc bán vé");
  checkDate(conference.startDate, "Ngày bắt đầu hội thảo");
  checkDate(conference.endDate, "Ngày kết thúc hội thảo");

  // Kiểm tra price phases
  conference.conferencePrices?.forEach((price) => {
    price.pricePhases?.forEach((phase, phaseIdx) => {
      checkDate(phase.startDate, `Giá vé "${price.ticketName}" - Phase ${phaseIdx + 1} (bắt đầu)`);
      checkDate(phase.endDate, `Giá vé "${price.ticketName}" - Phase ${phaseIdx + 1} (kết thúc)`);
    });
  });

  // === Kiểm tra theo loại hội thảo ===
  if (conferenceType === "technical") {
    const techConf = conference as TechnicalConferenceDetailResponse;
    techConf.sessions?.forEach((session) => {
      checkDate(session.startTime, `Session "${session.title}" (bắt đầu)`);
      checkDate(session.endTime, `Session "${session.title}" (kết thúc)`);
      checkDate(session.date, `Session "${session.title}" (ngày)`);
      checkDate(session.sessionDate, `Session "${session.title}" (ngày diễn ra)`);
    });
  } else {
    // Research
    const researchConf = conference as ResearchConferenceDetailResponse;

    researchConf.researchPhase?.forEach((phase, idx) => {
      const phaseLabel = phase.isWaitlist ? "Waitlist Phase" : `Phase ${idx + 1}`;
      
      checkDate(phase.registrationStartDate, `${phaseLabel} - Đăng ký (bắt đầu)`);
      checkDate(phase.registrationEndDate, `${phaseLabel} - Đăng ký (kết thúc)`);
      checkDate(phase.fullPaperStartDate, `${phaseLabel} - Full Paper (bắt đầu)`);
      checkDate(phase.fullPaperEndDate, `${phaseLabel} - Full Paper (kết thúc)`);
      checkDate(phase.reviewStartDate, `${phaseLabel} - Review (bắt đầu)`);
      checkDate(phase.reviewEndDate, `${phaseLabel} - Review (kết thúc)`);
      checkDate(phase.reviseStartDate, `${phaseLabel} - Revise (bắt đầu)`);
      checkDate(phase.reviseEndDate, `${phaseLabel} - Revise (kết thúc)`);
      checkDate(phase.cameraReadyStartDate, `${phaseLabel} - Camera Ready (bắt đầu)`);
      checkDate(phase.cameraReadyEndDate, `${phaseLabel} - Camera Ready (kết thúc)`);

      // Kiểm tra revision round deadlines
      phase.revisionRoundDeadlines?.forEach((round) => {
        checkDate(
          round.startSubmissionDate,
          `${phaseLabel} - Revision Round ${round.roundNumber} (bắt đầu)`
        );
        checkDate(
          round.endSubmissionDate,
          `${phaseLabel} - Revision Round ${round.roundNumber} (kết thúc)`
        );
      });
    });

    researchConf.researchSessions?.forEach((session, idx) => {
      checkDate(session.startTime, `Session "${session.title || `Session ${idx + 1}`}" (bắt đầu)`);
      checkDate(session.endTime, `Session "${session.title || `Session ${idx + 1}`}" (kết thúc)`);
      checkDate(session.date, `Session "${session.title || `Session ${idx + 1}`}" (ngày)`);
    });
  }

  return {
    valid: expiredDates.length === 0,
    expiredDates,
    message:
      expiredDates.length > 0
        ? "Một số mốc thời gian đã qua. Vui lòng cập nhật lại trước khi chuyển sang Ready."
        : undefined,
  };
};