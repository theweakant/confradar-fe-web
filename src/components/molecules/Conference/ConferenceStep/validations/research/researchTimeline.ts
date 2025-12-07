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
  value: number | undefined,
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
    return { isValid: true };
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
 * Validate timeline phải kết thúc trước ngày hội nghị bắt đầu (cho phase 2+)
 */
export const validateTimelineBeforeConferenceStart = (
  timelineEndDate: string,
  conferenceStartDate: string
): ValidationResult => {
  if (!timelineEndDate || !conferenceStartDate) {
    return { isValid: true };
  }

  const timelineEnd = new Date(timelineEndDate);
  const confStart = new Date(conferenceStartDate);

  if (timelineEnd >= confStart) {
    return {
      isValid: false,
      error: `Giai đoạn bổ sung phải kết thúc trước ngày hội nghị bắt đầu (${confStart.toLocaleDateString("vi-VN")})`,
    };
  }

  return { isValid: true };
};

/**
 * Validate toàn bộ một phase (bất kỳ phase nào)
 */
export const validateSingleResearchPhase = (
  phase: ResearchPhase,
  conferenceStartDate: string,
  isFirstPhase: boolean,
  previousPhase?: ResearchPhase
): ValidationResult => {
  const {
    registrationStartDate,
    registrationEndDate,
    abstractDecideStatusStart,
    abstractDecideStatusEnd,
    fullPaperStartDate,
    fullPaperEndDate,
    reviewStartDate,
    reviewEndDate,
    fullPaperDecideStatusStart,
    fullPaperDecideStatusEnd,
    reviseStartDate,
    reviseEndDate,
    revisionPaperDecideStatusStart,
    revisionPaperDecideStatusEnd,
    cameraReadyStartDate,
    cameraReadyEndDate,
    cameraReadyDecideStatusStart,
    cameraReadyDecideStatusEnd,
    authorPaymentStart,
    authorPaymentEnd,
    revisionRoundDeadlines,
    registrationDuration,
    abstractDecideStatusDuration,
    fullPaperDuration,
    reviewDuration,
    fullPaperDecideStatusDuration,
    reviseDuration,
    revisionPaperDecideStatusDuration,
    cameraReadyDuration,
    cameraReadyDecideStatusDuration,
  } = phase;

  // 1. Kiểm tra đầy đủ các trường bắt buộc
  const requiredDates = [
    { value: registrationStartDate, name: "Registration Start" },
    { value: registrationEndDate, name: "Registration End" },
    { value: abstractDecideStatusStart, name: "Abstract Decide Start" },
    { value: abstractDecideStatusEnd, name: "Abstract Decide End" },
    { value: fullPaperStartDate, name: "Full Paper Start" },
    { value: fullPaperEndDate, name: "Full Paper End" },
    { value: reviewStartDate, name: "Review Start" },
    { value: reviewEndDate, name: "Review End" },
    { value: fullPaperDecideStatusStart, name: "Full Paper Decide Start" },
    { value: fullPaperDecideStatusEnd, name: "Full Paper Decide End" },
    { value: reviseStartDate, name: "Revise Start" },
    { value: reviseEndDate, name: "Revise End" },
    { value: revisionPaperDecideStatusStart, name: "Revision Paper Decide Start" },
    { value: revisionPaperDecideStatusEnd, name: "Revision Paper Decide End" },
    { value: cameraReadyStartDate, name: "Camera Ready Start" },
    { value: cameraReadyEndDate, name: "Camera Ready End" },
    { value: cameraReadyDecideStatusStart, name: "Camera Ready Decide Start" },
    { value: cameraReadyDecideStatusEnd, name: "Camera Ready Decide End" },
    { value: authorPaymentStart, name: "Author Payment Start" },
    { value: authorPaymentEnd, name: "Author Payment End" },
  ];

  for (const { value, name } of requiredDates) {
    if (!value) {
      return { isValid: false, error: `Vui lòng điền đầy đủ: ${name}` };
    }
    const dateResult = validateTimelineDate(value, name);
    if (!dateResult.isValid) return dateResult;
  }

  // 2. Validate durations
  const durations = [
    { value: registrationDuration, name: "Thời gian đăng ký" },
    { value: abstractDecideStatusDuration, name: "Thời gian quyết định Abstract" },
    { value: fullPaperDuration, name: "Thời gian nộp Full Paper" },
    { value: reviewDuration, name: "Thời gian Review" },
    { value: fullPaperDecideStatusDuration, name: "Thời gian quyết định Full Paper" },
    { value: reviseDuration, name: "Thời gian Revise" },
    { value: revisionPaperDecideStatusDuration, name: "Thời gian quyết định Revision Paper" },
    { value: cameraReadyDuration, name: "Thời gian Camera Ready" },
    { value: cameraReadyDecideStatusDuration, name: "Thời gian quyết định Camera Ready" },
  ];

  for (const { value, name } of durations) {
    const result = validateTimelineDuration(value, name);
    if (!result.isValid) return result;
  }

  // 3. Validate date ranges (start < end)
  const dateRanges = [
    { start: registrationStartDate, end: registrationEndDate, name: "Registration" },
    { start: abstractDecideStatusStart, end: abstractDecideStatusEnd, name: "Abstract Decide" },
    { start: fullPaperStartDate, end: fullPaperEndDate, name: "Full Paper" },
    { start: reviewStartDate, end: reviewEndDate, name: "Review" },
    { start: fullPaperDecideStatusStart, end: fullPaperDecideStatusEnd, name: "Full Paper Decide" },
    { start: reviseStartDate, end: reviseEndDate, name: "Revise" },
    { start: revisionPaperDecideStatusStart, end: revisionPaperDecideStatusEnd, name: "Revision Paper Decide" },
    { start: cameraReadyStartDate, end: cameraReadyEndDate, name: "Camera Ready" },
    { start: cameraReadyDecideStatusStart, end: cameraReadyDecideStatusEnd, name: "Camera Ready Decide" },
    { start: authorPaymentStart, end: authorPaymentEnd, name: "Author Payment" },
  ];

  for (const { start, end, name } of dateRanges) {
    const result = validateDateRange(start, end, name);
    if (!result.isValid) return result;
  }

  // 4. Validate nội tại: thứ tự giữa các giai đoạn
  const internalSequences = [
    { prevEnd: registrationEndDate, currStart: abstractDecideStatusStart, prevName: "Registration", currName: "Abstract Decide" },
    { prevEnd: abstractDecideStatusEnd, currStart: fullPaperStartDate, prevName: "Abstract Decide", currName: "Full Paper" },
    { prevEnd: fullPaperEndDate, currStart: reviewStartDate, prevName: "Full Paper", currName: "Review" },
    { prevEnd: reviewEndDate, currStart: fullPaperDecideStatusStart, prevName: "Review", currName: "Full Paper Decide" },
    { prevEnd: fullPaperDecideStatusEnd, currStart: reviseStartDate, prevName: "Full Paper Decide", currName: "Revise" },
    { prevEnd: reviseEndDate, currStart: revisionPaperDecideStatusStart, prevName: "Revise", currName: "Revision Paper Decide" },
    { prevEnd: revisionPaperDecideStatusEnd, currStart: cameraReadyStartDate, prevName: "Revision Paper Decide", currName: "Camera Ready" },
    { prevEnd: cameraReadyEndDate, currStart: cameraReadyDecideStatusStart, prevName: "Camera Ready", currName: "Camera Ready Decide" },
    { prevEnd: cameraReadyDecideStatusEnd, currStart: authorPaymentStart, prevName: "Camera Ready Decide", currName: "Author Payment" },
  ];

  for (const { prevEnd, currStart, prevName, currName } of internalSequences) {
    const result = validatePhaseSequence(prevEnd, currStart, prevName, currName);
    if (!result.isValid) return result;
  }

  // 5. Validate với phase trước (không chồng chéo)
  if (previousPhase) {
    const prevPayEnd = previousPhase.authorPaymentEnd;
    const currRegStart = registrationStartDate;
    if (currRegStart <= prevPayEnd) {
      return {
        isValid: false,
        error: "Giai đoạn này bị chồng chéo với giai đoạn trước!",
      };
    }
  }

  // 6. Validate phase 2,3,... phải kết thúc trước ngày hội nghị
  if (!isFirstPhase) {
    const result = validateTimelineBeforeConferenceStart(authorPaymentEnd, conferenceStartDate);
    if (!result.isValid) return result;
  }

  // 7. Validate revision rounds (nếu có)
  if (revisionRoundDeadlines && revisionRoundDeadlines.length > 0) {
    const roundsResult = validateRevisionRounds(
      revisionRoundDeadlines,
      reviseStartDate,
      reviseEndDate
    );
    if (!roundsResult.isValid) return roundsResult;
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
    return { isValid: true };
  }

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

    if (roundStart >= roundEnd) {
      return {
        isValid: false,
        error: `Vòng chỉnh sửa ${round.roundNumber}: Ngày bắt đầu phải trước ngày kết thúc`,
      };
    }
  }

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
 * Validate toàn bộ mảng research phases (hỗ trợ N phases)
 */
export const validateAllResearchPhases = (
  phases: ResearchPhase[],
  conferenceStartDate: string
): ValidationResult => {
  if (phases.length === 0) {
    return { isValid: false, error: "Phải có ít nhất 1 giai đoạn timeline!" };
  }

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const isFirst = i === 0;
    const previous = i > 0 ? phases[i - 1] : undefined;

    const result = validateSingleResearchPhase(phase, conferenceStartDate, isFirst, previous);
    if (!result.isValid) {
      return {
        isValid: false,
        error: `Giai đoạn ${i + 1}: ${result.error}`,
      };
    }
  }

  return { isValid: true };
};