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

export const validateConferenceForStatusChange = (
  conference: Conference,
  conferenceType: ConferenceType
): ValidationReport => {
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];

  // === 1. Ngày bắt đầu & kết thúc (bắt buộc với cả 2 loại) ===
  if (!conference.startDate) missingRequired.push("Ngày bắt đầu");
  if (!conference.endDate) missingRequired.push("Ngày kết thúc");

  // === 2. Các thành phần chung bắt buộc (có ở cả 2 loại) ===
  if ((conference.conferencePrices?.length || 0) === 0) missingRequired.push("Giá vé");
  if ((conference.policies?.length || 0) === 0) missingRequired.push("Chính sách");
  if ((conference.sponsors?.length || 0) === 0) missingRequired.push("Nhà tài trợ");
  if ((conference.conferenceMedia?.length || 0) === 0) missingRequired.push("Hình ảnh/video");

  // === 3. Phân biệt theo loại hội thảo ===
  if (conferenceType === "technical") {
    // Ép kiểu an toàn: tại đây conference chắc chắn có `sessions`
    const techConf = conference as TechnicalConferenceDetailResponse;
    if ((techConf.sessions?.length || 0) === 0) {
      missingRequired.push("Session");
    }
  } else {
    // research
    const researchConf = conference as ResearchConferenceDetailResponse;
    if ((researchConf.researchPhase?.length || 0) === 0) {
      missingRequired.push("Giai đoạn hội thảo");
    }
    if ((researchConf.researchSessions?.length || 0) === 0) {
      missingRequired.push("Lịch trình (sessions)");
    }

    // Gợi ý (không bắt buộc)
    if ((researchConf.rankingReferenceUrls?.length || 0) === 0) {
      missingRecommended.push("Nên thêm link tham chiếu xếp hạng (CORE, v.v.)");
    }
  }

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingRecommended,
  };
};