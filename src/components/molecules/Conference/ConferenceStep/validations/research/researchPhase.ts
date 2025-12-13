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

/**
 * Validate a single Research Phase
 * Checks internal consistency and chronological order of all segments
 */
export const validateSingleResearchPhase = (
  phase: ResearchPhase,
  phaseIndex: number
): ValidationResult => {
  const phaseLabel = `Giai đoạn ${phaseIndex + 1}`;

  // 1. Check all required dates are filled
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
    authorPaymentStart,
    authorPaymentEnd,
  } = phase;

  if (
    !registrationStartDate ||
    !registrationEndDate ||
    !abstractDecideStatusStart ||
    !abstractDecideStatusEnd ||
    !fullPaperStartDate ||
    !fullPaperEndDate ||
    !reviewStartDate ||
    !reviewEndDate ||
    !fullPaperDecideStatusStart ||
    !fullPaperDecideStatusEnd ||
    !reviseStartDate ||
    !reviseEndDate ||
    !revisionPaperDecideStatusStart ||
    !revisionPaperDecideStatusEnd ||
    !cameraReadyStartDate ||
    !cameraReadyEndDate ||
    !authorPaymentStart ||
    !authorPaymentEnd
  ) {
    return {
      isValid: false,
      error: `${phaseLabel}: Vui lòng điền đầy đủ tất cả các ngày`,
    };
  }

  // 2. Convert to Date objects for comparison
  const dates = {
    regStart: new Date(registrationStartDate),
    regEnd: new Date(registrationEndDate),
    absDecideStart: new Date(abstractDecideStatusStart),
    absDecideEnd: new Date(abstractDecideStatusEnd),
    paperStart: new Date(fullPaperStartDate),
    paperEnd: new Date(fullPaperEndDate),
    reviewStart: new Date(reviewStartDate),
    reviewEnd: new Date(reviewEndDate),
    paperDecideStart: new Date(fullPaperDecideStatusStart),
    paperDecideEnd: new Date(fullPaperDecideStatusEnd),
    reviseStart: new Date(reviseStartDate),
    reviseEnd: new Date(reviseEndDate),
    revisionDecideStart: new Date(revisionPaperDecideStatusStart),
    revisionDecideEnd: new Date(revisionPaperDecideStatusEnd),
    camStart: new Date(cameraReadyStartDate),
    camEnd: new Date(cameraReadyEndDate),
    paymentStart: new Date(authorPaymentStart),
    paymentEnd: new Date(authorPaymentEnd),
  };

  // 3. Validate chronological order of the entire timeline
  const checks: Array<{
    condition: boolean;
    error: string;
  }> = [
    {
      condition: dates.regStart >= dates.regEnd,
      error: `${phaseLabel} - Registration: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.regEnd > dates.absDecideStart,
      error: `${phaseLabel} - Abstract Decide Status phải bắt đầu sau Registration kết thúc`,
    },
    {
      condition: dates.absDecideStart >= dates.absDecideEnd,
      error: `${phaseLabel} - Abstract Decide Status: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.absDecideEnd > dates.paperStart,
      error: `${phaseLabel} - Full Paper phải bắt đầu sau Abstract Decide Status kết thúc`,
    },
    {
      condition: dates.paperStart >= dates.paperEnd,
      error: `${phaseLabel} - Full Paper: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.paperEnd > dates.reviewStart,
      error: `${phaseLabel} - Review phải bắt đầu sau Full Paper kết thúc`,
    },
    {
      condition: dates.reviewStart >= dates.reviewEnd,
      error: `${phaseLabel} - Review: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.reviewEnd > dates.paperDecideStart,
      error: `${phaseLabel} - Full Paper Decide Status phải bắt đầu sau Review kết thúc`,
    },
    {
      condition: dates.paperDecideStart >= dates.paperDecideEnd,
      error: `${phaseLabel} - Full Paper Decide Status: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.paperDecideEnd > dates.reviseStart,
      error: `${phaseLabel} - Final Review phải bắt đầu sau Full Paper Decide Status kết thúc`,
    },
    {
      condition: dates.reviseStart >= dates.reviseEnd,
      error: `${phaseLabel} - Final Review: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.reviseEnd > dates.revisionDecideStart,
      error: `${phaseLabel} - Revision Paper Decide Status phải bắt đầu sau Final Review kết thúc`,
    },
    {
      condition: dates.revisionDecideStart >= dates.revisionDecideEnd,
      error: `${phaseLabel} - Revision Paper Decide Status: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.revisionDecideEnd > dates.camStart,
      error: `${phaseLabel} - Camera Ready phải bắt đầu sau Revision Paper Decide Status kết thúc`,
    },
    {
      condition: dates.camStart >= dates.camEnd,
      error: `${phaseLabel} - Camera Ready: Ngày bắt đầu phải trước ngày kết thúc`,
    },
    {
      condition: dates.camEnd >= dates.paymentStart,
      error: `${phaseLabel} - Author Payment phải bắt đầu sau Camera Ready kết thúc`,
    },
    {
      condition: dates.paymentStart >= dates.paymentEnd,
      error: `${phaseLabel} - Author Payment: Ngày bắt đầu phải trước ngày kết thúc`,
    },
  ];

  const failedCheck = checks.find((check) => check.condition);
  if (failedCheck) {
    return {
      isValid: false,
      error: failedCheck.error,
    };
  }

  // 4. Validate revision rounds if present
  if (phase.revisionRoundDeadlines && phase.revisionRoundDeadlines.length > 0) {
    for (const round of phase.revisionRoundDeadlines) {
      const roundStart = new Date(round.startSubmissionDate);
      const roundEnd = new Date(round.endSubmissionDate);

      // Check round is within revise period
      if (roundStart < dates.reviseStart || roundEnd > dates.reviseEnd) {
        return {
          isValid: false,
          error: `${phaseLabel} - Vòng ${round.roundNumber}: Phải nằm trong khoảng Final Review (${reviseStartDate} → ${reviseEndDate})`,
        };
      }

      // Validate round itself
      const roundValidation = validateRevisionRound(round, []);
      if (!roundValidation.isValid) {
        return {
          isValid: false,
          error: `${phaseLabel} - Vòng ${round.roundNumber}: ${roundValidation.error}`,
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Validate all Research Phases and their relationships
 * Checks both individual phases and phase-to-phase continuity
 */
export const validateAllResearchPhases = (
  phases: ResearchPhase[],
  conferenceStartDate?: string
): ValidationResult => {
  if (!phases || phases.length === 0) {
    return {
      isValid: false,
      error: "Phải có ít nhất 1 giai đoạn timeline",
    };
  }

  // 1. Validate each phase individually
  for (let i = 0; i < phases.length; i++) {
    const phaseValidation = validateSingleResearchPhase(phases[i], i);
    if (!phaseValidation.isValid) {
      return phaseValidation;
    }
  }

  // 2. Validate phase-to-phase continuity
  for (let i = 0; i < phases.length - 1; i++) {
    const currentPhase = phases[i];
    const nextPhase = phases[i + 1];

    const currentEnd = new Date(currentPhase.authorPaymentEnd);
    const nextStart = new Date(nextPhase.registrationStartDate);

    // Next phase must start after current phase ends
    if (nextStart <= currentEnd) {
      return {
        isValid: false,
        error: `Giai đoạn ${i + 2} phải bắt đầu sau khi Giai đoạn ${i + 1} kết thúc (sau ${currentPhase.authorPaymentEnd})`,
      };
    }
  }

  // 3. Validate first phase starts before conference start (if provided)
  if (conferenceStartDate) {
    const firstPhase = phases[0];
    const firstStart = new Date(firstPhase.registrationStartDate);
    const confStart = new Date(conferenceStartDate);

    if (firstStart >= confStart) {
      return {
        isValid: false,
        error: `Giai đoạn 1 phải bắt đầu trước ngày tổ chức hội nghị (${conferenceStartDate})`,
      };
    }
  }

  return { isValid: true };
};

/**
 * @deprecated This function is no longer used
 * Use validateAllResearchPhases instead
 */
export const validateResearchTimeline = (
  phases: ResearchPhase[],
  ticketSaleStart: string
): ValidationResult => {
  console.warn("validateResearchTimeline is deprecated. Use validateAllResearchPhases instead.");
  return validateAllResearchPhases(phases);
};

/**
 * @deprecated Waitlist phases are no longer supported
 */
export const validateWaitlistPhase = (
  mainPhase: ResearchPhase,
  waitlistPhase: ResearchPhase
): ValidationResult => {
  console.warn("validateWaitlistPhase is deprecated. Waitlist phases are no longer supported.");
  return { isValid: false, error: "Waitlist phases are no longer supported" };
};