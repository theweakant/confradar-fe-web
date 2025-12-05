// components/molecules/Status/validateConferenceStatus.ts

import type {
  TechnicalConferenceDetailResponse,
  ResearchConferenceDetailResponse,
} from "@/types/conference.type";
import type { CollaboratorContract } from "@/types/contract.type";

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

export interface ValidationContext {
  conference: Conference;
  conferenceType: ConferenceType;
  contract?: CollaboratorContract | null;
}

/**
 * Validate dữ liệu hội thảo trước khi chuyển trạng thái
 * Dùng cho: Draft → Pending, Preparing → Ready
 * 
 * Hành vi:
 * - Nếu KHÔNG có contract → validate đầy đủ (6 bước)
 * - Nếu có contract → chỉ validate các bước được bật trong contract
 */
export const validateConferenceForStatusChange = ({
  conference,
  conferenceType,
  contract,
}: ValidationContext): ValidationReport => {
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];

  // Luôn bắt buộc: ngày bắt đầu và kết thúc
  if (!conference.startDate) missingRequired.push("Ngày bắt đầu");
  if (!conference.endDate) missingRequired.push("Ngày kết thúc");

  // Xác định chế độ collaborator
  const isCollaborator = !!contract;

  // Xác định các bước được bật
  const hasPriceStep = !isCollaborator || contract!.isPriceStep;
  const hasSessionStep = !isCollaborator || contract!.isSessionStep;
  const hasPolicyStep = !isCollaborator || contract!.isPolicyStep;
  const hasMediaStep = !isCollaborator || contract!.isMediaStep;
  const hasSponsorStep = !isCollaborator || contract!.isSponsorStep;

  // Validate từng phần theo hợp đồng
  if (hasPriceStep && (conference.conferencePrices?.length || 0) === 0) {
    missingRequired.push("Chi phí");
  }

  if (hasPolicyStep && (conference.policies?.length || 0) === 0) {
    missingRequired.push("Chính sách");
  }

  if (hasSponsorStep && (conference.sponsors?.length || 0) === 0) {
    missingRequired.push("Nhà tài trợ");
  }

  if (hasMediaStep && (conference.conferenceMedia?.length || 0) === 0) {
    missingRequired.push("Hình ảnh/video");
  }

  // Validate session & phase theo loại hội thảo
  if (conferenceType === "technical") {
    if (hasSessionStep && (conference.sessions?.length || 0) === 0) {
      missingRequired.push("Session");
    }
  } else {
    const researchConf = conference as ResearchConferenceDetailResponse;
    if (hasSessionStep) {
      if ((researchConf.researchSessions?.length || 0) === 0) {
        missingRequired.push("Session");
      }
      if ((researchConf.researchPhase?.length || 0) === 0) {
        missingRequired.push("Giai đoạn");
      }
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
 * 
 * KHÔNG phụ thuộc vào contract — luôn kiểm tra toàn bộ timeline
 */
export const validateTimelineForOnHoldToReady = (
  conference: Conference,
  conferenceType: ConferenceType
): TimeValidationReport => {
  const now = new Date();
  const expiredDates: string[] = [];

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

  // const checkDate = (date: string | undefined, label: string) => {
  //   if (date) {
  //     const dateTime = new Date(date);
  //     if (dateTime < onHoldDateTime && now > dateTime) {
  //       expiredDates.push(label);
  //     }
  //   }
  // };


  const checkDate = (date: string | undefined, label: string) => {
  if (date) {
    const dateTime = new Date(date);
    if (dateTime < now) {
      expiredDates.push(label);
    }
  }
};
  checkDate(conference.ticketSaleStart, "Ngày bắt đầu bán vé");
  checkDate(conference.ticketSaleEnd, "Ngày kết thúc bán vé");
  checkDate(conference.startDate, "Ngày bắt đầu");
  checkDate(conference.endDate, "Ngày kết thúc");

  conference.conferencePrices?.forEach((price) => {
    price.pricePhases?.forEach((phase, phaseIdx) => {
      checkDate(phase.startDate, `Chi phí "${price.ticketName}" - Giai đoạn ${phaseIdx + 1} (bắt đầu)`);
      checkDate(phase.endDate, `Chi phí "${price.ticketName}" - Giai đoạn ${phaseIdx + 1} (kết thúc)`);
    });
  });

  if (conferenceType === "technical") {
    const techConf = conference as TechnicalConferenceDetailResponse;
    techConf.sessions?.forEach((session) => {
      checkDate(session.startTime, `Session "${session.title}" (bắt đầu)`);
      checkDate(session.endTime, `Session "${session.title}" (kết thúc)`);
      checkDate(session.date, `Session "${session.title}" (ngày)`);
      checkDate(session.sessionDate, `Session "${session.title}" (ngày diễn ra)`);
    });
  } else {
    const researchConf = conference as ResearchConferenceDetailResponse;

    researchConf.researchPhase?.forEach((phase, idx) => {
      const phaseLabel = phase.isWaitlist ? "Giai đoạn Waitlist" : `Phase ${idx + 1}`;
      
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