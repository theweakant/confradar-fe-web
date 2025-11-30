// Export all validation functions
export * from './basic';
export * from './price';
export * from './session';
export * from './policy';
export * from './media';
export * from './sponsor';

//research
export {
  validateConferenceName,
  validateDateRange,
  validateTotalSlot,
  validateTicketSaleStart,
  validateTicketSaleDuration,
  validateResearchTimingConstraint,
  validateResearchBasicForm,
} from './research/researchBasic'
export * from './research/materials'
export * from './research/researchDetail'
export * as ResearchPhaseValidation from './research/researchPhase';
export * from './research/researchPrice'
export {
  validateTimelineDate,
  validateTimelineDuration,
  validatePhaseSequence,
  validateTimelineBeforeTicketSale,
  validateRevisionRounds,
  validateResearchTimeline,
} from './research/researchTimeline';

export type { ValidationResult } from './basic';