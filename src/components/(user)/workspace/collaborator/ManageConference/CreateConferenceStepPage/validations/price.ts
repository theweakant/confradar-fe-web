import type { Ticket, Phase } from "@/types/conference.type";
import type { ValidationResult } from "./basic";

export const validateTicketName = (
  value: string,
  existingTickets: Ticket[] = []
): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Tên vé không được để trống' };
  }
  if (value.trim().length < 3) {
    return { isValid: false, error: 'Tên vé phải có ít nhất 3 ký tự' };
  }

  const isDuplicate = existingTickets.some(
    (t) => t.ticketName.toLowerCase() === value.trim().toLowerCase()
  );
  if (isDuplicate) {
    return { isValid: false, error: 'Tên vé đã tồn tại' };
  }

  return { isValid: true };
};

export const validateTicketPrice = (value: number): ValidationResult => {
  if (value <= 0) {
    return { isValid: false, error: 'Giá vé phải lớn hơn 0' };
  }
  if (value > 100000000) {
    return { isValid: false, error: 'Giá vé không hợp lệ (tối đa 100 triệu)' };
  }

  if (value < 10000) {
    return {
      isValid: true,
      warning: 'Giá vé thấp hơn mức khuyến nghị (10,000 VND)',
    };
  }

  return { isValid: true };
};

export const validateTicketTotalSlot = (
  value: number,
  conferenceMaxSlot: number
): ValidationResult => {
  if (value <= 0) {
    return { isValid: false, error: 'Số lượng vé phải lớn hơn 0' };
  }
  if (value > conferenceMaxSlot) {
    return {
      isValid: false,
      error: `Số lượng vượt quá sức chứa (${conferenceMaxSlot})`,
    };
  }
  return { isValid: true };
};

export const validatePhaseName = (
  value: string,
  existingPhases: Phase[] = []
): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Tên giai đoạn không được để trống' };
  }

  const isDuplicate = existingPhases.some(
    (p) => p.phaseName.toLowerCase() === value.trim().toLowerCase()
  );
  if (isDuplicate) {
    return { isValid: false, error: 'Tên giai đoạn đã tồn tại' };
  }

  return { isValid: true };
};

export const validatePhaseStartDate = (
  startDate: string,
  saleStart: string,
  saleEnd: string
): ValidationResult => {
  if (!startDate) {
    return { isValid: false, error: 'Vui lòng chọn ngày bắt đầu' };
  }

  const phaseStart = new Date(startDate);
  const ticketSaleStart = new Date(saleStart);
  const ticketSaleEnd = new Date(saleEnd);

  if (phaseStart < ticketSaleStart || phaseStart > ticketSaleEnd) {
    return {
      isValid: false,
      error: `Phải trong khoảng ${ticketSaleStart.toLocaleDateString('vi-VN')} - ${ticketSaleEnd.toLocaleDateString('vi-VN')}`,
    };
  }

  return { isValid: true };
};

export const validatePhaseDuration = (
  duration: number,
  startDate: string,
  saleEnd: string
): ValidationResult => {
  if (duration < 1) {
    return { isValid: false, error: 'Thời gian phải ít nhất 1 ngày' };
  }

  if (startDate && saleEnd) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    const maxEnd = new Date(saleEnd);

    if (end > maxEnd) {
      return { isValid: false, error: 'Giai đoạn vượt quá thời gian bán vé' };
    }
  }

  return { isValid: true };
};

export const validatePhaseSlot = (
  slot: number,
  ticketTotal: number,
  usedSlots: number
): ValidationResult => {
  if (slot <= 0) {
    return { isValid: false, error: 'Số lượng phải lớn hơn 0' };
  }

  const remaining = ticketTotal - usedSlots;
  if (slot > remaining) {
    return { isValid: false, error: `Chỉ còn ${remaining} slot khả dụng` };
  }

  return { isValid: true };
};

export const validatePhaseOverlap = (
  newPhase: { startDate: string; endDate: string },
  existingPhases: Phase[]
): ValidationResult => {
  const newStart = new Date(newPhase.startDate);
  const newEnd = new Date(newPhase.endDate);

  const hasOverlap = existingPhases.some((p) => {
    const pStart = new Date(p.startDate);
    const pEnd = new Date(p.endDate);
    return newStart <= pEnd && newEnd >= pStart;
  });

  if (hasOverlap) {
    return {
      isValid: false,
      error: 'Giai đoạn này bị trùng thời gian với giai đoạn khác!',
    };
  }

  return { isValid: true };
};