import type { ConferenceBasicForm } from "@/types/conference.type";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export const validateConferenceName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Tên hội thảo không được để trống' };
  }
  if (value.trim().length < 10) {
    return { isValid: false, error: 'Tên hội thảo phải có ít nhất 10 ký tự' };
  }
  if (value.trim().length > 200) {
    return { isValid: false, error: 'Tên hội thảo không được vượt quá 200 ký tự' };
  }
  return { isValid: true };
};

export const validateDateRange = (value: number): ValidationResult => {
  if (value < 1) {
    return { isValid: false, error: 'Số ngày phải lớn hơn 0' };
  }
  if (value > 365) {
    return { isValid: false, error: 'Số ngày không được vượt quá 365' };
  }
  return { isValid: true };
};

export const validateTotalSlot = (value: number): ValidationResult => {
  if (value < 1) {
    return { isValid: false, error: 'Sức chứa phải lớn hơn 0' };
  }
  if (value > 100000) {
    return { isValid: false, error: 'Sức chứa không được vượt quá 100,000' };
  }
  return { isValid: true };
};

export const validateTicketSaleStart = (
  saleStart: string,
  eventStart: string
): ValidationResult => {
  if (!saleStart) {
    return { isValid: false, error: 'Vui lòng chọn ngày bắt đầu bán vé' };
  }
  if (!eventStart) {
    return { isValid: true };
  }

  const saleDate = new Date(saleStart);
  const eventDate = new Date(eventStart);

  if (saleDate >= eventDate) {
    return { isValid: false, error: 'Ngày bán vé phải trước ngày sự kiện' };
  }

  const daysDiff = Math.floor(
    (eventDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff < 7) {
    return {
      isValid: true,
      warning: 'Khuyến nghị: Nên bán vé trước ít nhất 7 ngày',
    };
  }

  return { isValid: true };
};

export const validateTicketSaleDuration = (
  duration: number,
  saleStart: string,
  eventStart: string
): ValidationResult => {
  if (duration < 1) {
    return { isValid: false, error: 'Thời gian bán vé phải ít nhất 1 ngày' };
  }

  if (saleStart && eventStart) {
    const saleStartDate = new Date(saleStart);
    const saleEndDate = new Date(saleStartDate);
    saleEndDate.setDate(saleEndDate.getDate() + duration - 1);
    const eventStartDate = new Date(eventStart);

    if (saleEndDate >= eventStartDate) {
      return {
        isValid: false,
        error: 'Ngày kết thúc bán vé phải trước ngày sự kiện',
      };
    }
  }

  return { isValid: true };
};

export const validateAddress = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Địa chỉ không được để trống' };
  }
  return { isValid: true };
};

export const validateCityId = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Vui lòng chọn thành phố' };
  }
  return { isValid: true };
};

export const validateConferenceCategoryId = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Vui lòng chọn danh mục' };
  }
  return { isValid: true };
};

export const validateBasicForm = (form: ConferenceBasicForm): ValidationResult => {
  const saleStart = new Date(form.ticketSaleStart);
  const saleEnd = new Date(form.ticketSaleEnd);
  const eventStart = new Date(form.startDate);

  if (saleStart >= eventStart || saleEnd >= eventStart) {
    return {
      isValid: false,
      error: 'Hãy chọn ngày bán vé trước ngày bắt đầu sự kiện',
    };
  }
  if (!form.conferenceName.trim()) {
    return { isValid: false, error: 'Vui lòng nhập tên hội thảo!' };
  }
  if (!form.startDate || !form.endDate) {
    return {
      isValid: false,
      error: 'Vui lòng chọn ngày bắt đầu và kết thúc!',
    };
  }
  if (!form.conferenceCategoryId) {
    return { isValid: false, error: 'Vui lòng chọn danh mục!' };
  }
  return { isValid: true };
};