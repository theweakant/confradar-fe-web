import type { ResearchPhase, RevisionRoundDeadline } from "@/types/conference.type";
import type { ValidationResult } from "../basic";

export const validatePhaseDate = (
  startDate: string,
  endDate: string,
  phaseName: string
): ValidationResult => {
  if (!startDate || !endDate) {
    return { isValid: false, error: `${phaseName}: Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc` };
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

export const validatePhaseDuration = (duration: number): ValidationResult => {
  if (duration < 1) {
    return { isValid: false, error: "Thời gian phải ít nhất 1 ngày" };
  }
  if (duration > 365) {
    return { isValid: false, error: "Thời gian không được vượt quá 365 ngày" };
  }
  return { isValid: true };
};

export const validateRevisionRound = (
  round: RevisionRoundDeadline,
  existingRounds: RevisionRoundDeadline[]
): ValidationResult => {
  if (round.roundNumber < 1) {
    return { isValid: false, error: "Số vòng phải lớn hơn 0" };
  }

  if (!round.startSubmissionDate || !round.endSubmissionDate) {
    return { isValid: false, error: "Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc" };
  }

  const start = new Date(round.startSubmissionDate);
  const end = new Date(round.endSubmissionDate);

  if (start >= end) {
    return {
      isValid: false,
      error: "Ngày bắt đầu phải trước ngày kết thúc",
    };
  }

  // Check for overlaps
  const hasOverlap = existingRounds.some((existing) => {
    const existingStart = new Date(existing.startSubmissionDate);
    const existingEnd = new Date(existing.endSubmissionDate);
    return start <= existingEnd && end >= existingStart;
  });

  if (hasOverlap) {
    return {
      isValid: false,
      error: "Vòng chỉnh sửa này bị trùng thời gian với vòng khác",
    };
  }

  return { isValid: true };
};

export const validateResearchTimeline = (
  phases: ResearchPhase[],
  ticketSaleStart: string
): ValidationResult => {
  const mainPhase = phases.find((p) => !p.isWaitlist);

  if (!mainPhase) {
    return { isValid: false, error: "Thiếu timeline chính (main phase) cho hội thảo" };
  }

  const {
    registrationStartDate,
    registrationEndDate,
    fullPaperStartDate,
    fullPaperEndDate,
    reviewStartDate,
    reviewEndDate,
    reviseStartDate,
    reviseEndDate,
    cameraReadyStartDate,
    cameraReadyEndDate,
  } = mainPhase;

  // Check all required dates are filled
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

  // Convert to Date objects
  const regStart = new Date(registrationStartDate);
  const regEnd = new Date(registrationEndDate);
  const paperStart = new Date(fullPaperStartDate);
  const paperEnd = new Date(fullPaperEndDate);
  const revStart = new Date(reviewStartDate);
  const revEnd = new Date(reviewEndDate);
  const reviseStart = new Date(reviseStartDate);
  const reviseEnd = new Date(reviseEndDate);
  const camStart = new Date(cameraReadyStartDate);
  const camEnd = new Date(cameraReadyEndDate);
  const saleStart = new Date(ticketSaleStart);

  // Validate timeline order (chain validation)
  if (regStart >= regEnd) {
    return {
      isValid: false,
      error: "Registration: Ngày bắt đầu phải trước ngày kết thúc",
    };
  }

  if (regEnd >= paperStart) {
    return {
      isValid: false,
      error: "FullPaper phải bắt đầu sau khi Registration kết thúc",
    };
  }

  if (paperStart >= paperEnd) {
    return {
      isValid: false,
      error: "FullPaper: Ngày bắt đầu phải trước ngày kết thúc",
    };
  }

  if (paperEnd >= revStart) {
    return {
      isValid: false,
      error: "Review phải bắt đầu sau khi FullPaper kết thúc",
    };
  }

  if (revStart >= revEnd) {
    return {
      isValid: false,
      error: "Review: Ngày bắt đầu phải trước ngày kết thúc",
    };
  }

  if (revEnd >= reviseStart) {
    return {
      isValid: false,
      error: "Revise phải bắt đầu sau khi Review kết thúc",
    };
  }

  if (reviseStart >= reviseEnd) {
    return {
      isValid: false,
      error: "Revise: Ngày bắt đầu phải trước ngày kết thúc",
    };
  }

  if (reviseEnd >= camStart) {
    return {
      isValid: false,
      error: "CameraReady phải bắt đầu sau khi Revise kết thúc",
    };
  }

  if (camStart >= camEnd) {
    return {
      isValid: false,
      error: "CameraReady: Ngày bắt đầu phải trước ngày kết thúc",
    };
  }

  // Critical: Timeline must end before ticket sale starts
  if (camEnd >= saleStart) {
    return {
      isValid: false,
      error: `Timeline research phải kết thúc trước khi bán vé! CameraReady phải kết thúc trước ${saleStart.toLocaleDateString("vi-VN")}`,
    };
  }

  return { isValid: true };
};

export const validateWaitlistPhase = (
  mainPhase: ResearchPhase,
  waitlistPhase: ResearchPhase
): ValidationResult => {
  if (!waitlistPhase.isWaitlist) {
    return { isValid: false, error: "Phase này không phải waitlist phase" };
  }

  // Waitlist dates should be after main phase
  const mainCamEnd = new Date(mainPhase.cameraReadyEndDate);
  const waitlistRegStart = new Date(waitlistPhase.registrationStartDate);

  if (waitlistRegStart <= mainCamEnd) {
    return {
      isValid: false,
      error: "Waitlist phase phải bắt đầu sau khi main phase kết thúc",
    };
  }

  // Validate waitlist phase structure
  return validateResearchTimeline([waitlistPhase], "9999-12-31"); // Use far future date for validation
};