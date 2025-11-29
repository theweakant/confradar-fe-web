import type { ResearchPhase } from "@/types/conference.type";
import type { ValidationResult } from "../basic";

/**
 * Validate từng field ngày trong timeline
 */
export const validateTimelineDate = (
  value: string,
  fieldName: string
): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} không được để trống` };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} không hợp lệ` };
  }

  return { isValid: true };
};

/**
 * Validate duration phải lớn hơn 0
 */
export const validateTimelineDuration = (
  value: number | undefined, // ✅ Thêm undefined
  fieldName: string
): ValidationResult => {
  if (value === undefined || value === null) {
    return { isValid: false, error: `${fieldName} không được để trống` };
  }

  if (value < 1) {
    return { isValid: false, error: `${fieldName} phải ít nhất 1 ngày` };
  }

  if (value > 365) {
    return { isValid: false, error: `${fieldName} không được vượt quá 365 ngày` };
  }

  return { isValid: true };
};

/**
 * Validate date range: startDate phải trước endDate
 */
export const validateDateRange = (
  startDate: string,
  endDate: string,
  phaseName: string
): ValidationResult => {
  if (!startDate || !endDate) {
    return { isValid: true }; 
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return {
      isValid: false,
      error: `${phaseName}: Ngày bắt đầu phải trước ngày kết thúc`,
    };
  }

  return { isValid: true };
};

/**
 * Validate phase sequence: phase sau phải bắt đầu sau khi phase trước kết thúc
 */
export const validatePhaseSequence = (
  previousEndDate: string,
  currentStartDate: string,
  previousPhaseName: string,
  currentPhaseName: string
): ValidationResult => {
  if (!previousEndDate || !currentStartDate) {
    return { isValid: true }; // Skip nếu chưa có đủ dữ liệu
  }

  const prevEnd = new Date(previousEndDate);
  const currStart = new Date(currentStartDate);

  if (currStart <= prevEnd) {
    return {
      isValid: false,
      error: `${currentPhaseName} phải bắt đầu sau khi ${previousPhaseName} kết thúc`,
    };
  }

  return { isValid: true };
};

/**
 * Validate timeline phải kết thúc trước ngày bán 
 */
export const validateTimelineBeforeTicketSale = (
  timelineEndDate: string,
  ticketSaleStartDate: string
): ValidationResult => {
  if (!timelineEndDate || !ticketSaleStartDate) {
    return { isValid: true }; // Skip nếu chưa có đủ dữ liệu
  }

  const timelineEnd = new Date(timelineEndDate);
  const saleStart = new Date(ticketSaleStartDate);

  if (timelineEnd >= saleStart) {
    return {
      isValid: false,
      error: `Timeline research phải kết thúc trước ngày bán  (${saleStart.toLocaleDateString("vi-VN")})`,
    };
  }

  // Warning nếu khoảng cách quá gần
  const daysDiff = Math.floor(
    (saleStart.getTime() - timelineEnd.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff < 3) {
    return {
      isValid: true,
      warning: "Khuyến nghị: Timeline nên kết thúc trước ngày bán ít nhất 3 ngày",
    };
  }

  return { isValid: true };
};

/**
 * Validate revision round deadlines
 */
export const validateRevisionRounds = (
  rounds: Array<{ roundNumber: number; startSubmissionDate: string; endSubmissionDate: string }>,
  reviseStartDate: string,
  reviseEndDate: string
): ValidationResult => {
  if (rounds.length === 0) {
    return { isValid: true }; // Optional
  }

  // Check tất cả rounds phải nằm trong khoảng revise phase
  const reviseStart = new Date(reviseStartDate);
  const reviseEnd = new Date(reviseEndDate);

  for (const round of rounds) {
    const roundStart = new Date(round.startSubmissionDate);
    const roundEnd = new Date(round.endSubmissionDate);

    if (roundStart < reviseStart || roundEnd > reviseEnd) {
      return {
        isValid: false,
        error: `Vòng chỉnh sửa ${round.roundNumber} phải nằm trong khoảng thời gian Revise (${reviseStart.toLocaleDateString("vi-VN")} - ${reviseEnd.toLocaleDateString("vi-VN")})`,
      };
    }

    // Check start < end
    if (roundStart >= roundEnd) {
      return {
        isValid: false,
        error: `Vòng chỉnh sửa ${round.roundNumber}: Ngày bắt đầu phải trước ngày kết thúc`,
      };
    }
  }

  // Check không có overlap giữa các rounds
  for (let i = 0; i < rounds.length; i++) {
    for (let j = i + 1; j < rounds.length; j++) {
      const round1Start = new Date(rounds[i].startSubmissionDate);
      const round1End = new Date(rounds[i].endSubmissionDate);
      const round2Start = new Date(rounds[j].startSubmissionDate);
      const round2End = new Date(rounds[j].endSubmissionDate);

      if (round1Start <= round2End && round2Start <= round1End) {
        return {
          isValid: false,
          error: `Vòng chỉnh sửa ${rounds[i].roundNumber} và ${rounds[j].roundNumber} bị trùng thời gian`,
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Validate toàn bộ research timeline (main phase)
 */
export const validateResearchTimeline = (
  mainPhase: ResearchPhase,
  ticketSaleStart: string
): ValidationResult => {
  // 1. Check main phase tồn tại
  if (!mainPhase) {
    return { isValid: false, error: "Thiếu timeline chính (main phase) cho hội nghị" };
  }

  const {
    registrationStartDate,
    registrationEndDate,
    registrationDuration,
    fullPaperStartDate,
    fullPaperEndDate,
    fullPaperDuration,
    reviewStartDate,
    reviewEndDate,
    reviewDuration,
    reviseStartDate,
    reviseEndDate,
    reviseDuration,
    cameraReadyStartDate,
    cameraReadyEndDate,
    cameraReadyDuration,
    revisionRoundDeadlines,
  } = mainPhase;

  // 2. Check all required dates are filled
  if (
    !registrationStartDate ||
    !registrationEndDate ||
    !fullPaperStartDate ||
    !fullPaperEndDate ||
    !reviewStartDate ||
    !reviewEndDate ||
    !reviseStartDate ||
    !reviseEndDate ||
    !cameraReadyStartDate ||
    !cameraReadyEndDate ||
    !ticketSaleStart
  ) {
    return {
      isValid: false,
      error: "Vui lòng điền đầy đủ tất cả các ngày trong Timeline chính",
    };
  }

  // 3. Validate durations
  const durationValidations = [
    { value: registrationDuration, name: "Thời gian đăng ký" },
    { value: fullPaperDuration, name: "Thời gian nộp Full Paper" },
    { value: reviewDuration, name: "Thời gian phản biện" },
    { value: reviseDuration, name: "Thời gian chỉnh sửa" },
    { value: cameraReadyDuration, name: "Thời gian Camera Ready" },
  ];

  for (const { value, name } of durationValidations) {
    const result = validateTimelineDuration(value, name);
    if (!result.isValid) return result;
  }

  // 4. Validate date ranges (start < end)
  const dateRanges = [
    { start: registrationStartDate, end: registrationEndDate, name: "Registration" },
    { start: fullPaperStartDate, end: fullPaperEndDate, name: "Full Paper" },
    { start: reviewStartDate, end: reviewEndDate, name: "Review" },
    { start: reviseStartDate, end: reviseEndDate, name: "Revise" },
    { start: cameraReadyStartDate, end: cameraReadyEndDate, name: "Camera Ready" },
  ];

  for (const { start, end, name } of dateRanges) {
    const result = validateDateRange(start, end, name);
    if (!result.isValid) return result;
  }

  // 5. Validate phase sequence
  const phaseSequences = [
    {
      prevEnd: registrationEndDate,
      currStart: fullPaperStartDate,
      prevName: "Registration",
      currName: "Full Paper",
    },
    {
      prevEnd: fullPaperEndDate,
      currStart: reviewStartDate,
      prevName: "Full Paper",
      currName: "Review",
    },
    {
      prevEnd: reviewEndDate,
      currStart: reviseStartDate,
      prevName: "Review",
      currName: "Revise",
    },
    {
      prevEnd: reviseEndDate,
      currStart: cameraReadyStartDate,
      prevName: "Revise",
      currName: "Camera Ready",
    },
  ];

  for (const { prevEnd, currStart, prevName, currName } of phaseSequences) {
    const result = validatePhaseSequence(prevEnd, currStart, prevName, currName);
    if (!result.isValid) return result;
  }

  // 6. Validate timeline ends before ticket sale
  const timelineEndResult = validateTimelineBeforeTicketSale(
    cameraReadyEndDate,
    ticketSaleStart
  );
  if (!timelineEndResult.isValid) return timelineEndResult;

  // 7. Validate revision rounds (optional)
  if (revisionRoundDeadlines && revisionRoundDeadlines.length > 0) {
    const roundsResult = validateRevisionRounds(
      revisionRoundDeadlines,
      reviseStartDate,
      reviseEndDate
    );
    if (!roundsResult.isValid) return roundsResult;
  }

  // Return success with potential warning
  return timelineEndResult.warning
    ? { isValid: true, warning: timelineEndResult.warning }
    : { isValid: true };
};