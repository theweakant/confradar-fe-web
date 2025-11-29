import { toast } from "sonner";
import type { ConferenceBasicForm } from "@/types/conference.type";

// ============================================
// TYPE
// ============================================
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  message?:string
}

// ============================================
// COMMON VALIDATORS (DÙNG CHUNG CHO CẢ CONFERENCE & RESEARCH)
// ============================================

export const validateConferenceName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: "Tên hội thảo không được để trống" };
  }
  if (value.trim().length < 10) {
    return { isValid: false, error: "Tên hội thảo phải có ít nhất 10 ký tự" };
  }
  if (value.trim().length > 200) {
    return { isValid: false, error: "Tên hội thảo không được vượt quá 200 ký tự" };
  }
  return { isValid: true };
};

export const validateDateRange = (value: number): ValidationResult => {
  if (value < 1) {
    return { isValid: false, error: "Số ngày phải lớn hơn 0" };
  }
  if (value > 365) {
    return { isValid: false, error: "Số ngày không được vượt quá 365" };
  }
  return { isValid: true };
};

export const validateTotalSlot = (value: number): ValidationResult => {
  if (value < 1) {
    return { isValid: false, error: "Số lượng tham dự phải lớn hơn 0" };
  }
  if (value > 1000) {
    return { isValid: false, error: "Số lượng tham dự không được vượt quá 100,000" };
  }
  return { isValid: true };
};

export const validateTicketSaleStart = (
  saleStart: string,
  eventStart: string
): ValidationResult => {
  if (!saleStart) {
    return { isValid: false, error: "Vui lòng chọn ngày bắt đầu bán" };
  }
  if (!eventStart) {
    return { isValid: true };
  }

  const saleDate = new Date(saleStart);
  const eventDate = new Date(eventStart);

  if (saleDate >= eventDate) {
    return { isValid: false, error: "Ngày bán phải trước ngày khai mạc" };
  }

  const daysDiff = Math.floor(
    (eventDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysDiff < 7) {
    return {
      isValid: true,
      warning: "Khuyến nghị: Nên bán trước ít nhất 7 ngày",
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
    return { isValid: false, error: "Thời gian bán phải ít nhất 1 ngày" };
  }

  if (saleStart && eventStart) {
    const saleStartDate = new Date(saleStart);
    const saleEndDate = new Date(saleStartDate);
    saleEndDate.setDate(saleEndDate.getDate() + duration - 1);
    const eventStartDate = new Date(eventStart);

    if (saleEndDate >= eventStartDate) {
      return {
        isValid: false,
        error: "Ngày kết thúc bán phải trước ngày sự kiện",
      };
    }
  }

  return { isValid: true };
};

export const validateAddress = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: "Địa chỉ không được để trống" };
  }
  return { isValid: true };
};

export const validateCityId = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Vui lòng chọn thành phố" };
  }
  return { isValid: true };
};

export const validateConferenceCategoryId = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Vui lòng chọn danh mục" };
  }
  return { isValid: true };
};

// ============================================
// BASIC FORM VALIDATION
// ============================================

export const validateBasicForm = (form: ConferenceBasicForm): ValidationResult => {
  const saleStart = new Date(form.ticketSaleStart);
  const saleEnd = new Date(form.ticketSaleEnd);
  const eventStart = new Date(form.startDate);

  if (saleStart >= eventStart || saleEnd >= eventStart) {
    return {
      isValid: false,
      error: "Hãy chọn ngày bán trước ngày bắt đầu sự kiện",
    };
  }
  if (!form.conferenceName.trim()) {
    return { isValid: false, error: "Vui lòng nhập tên hội thảo!" };
  }
  if (!form.startDate || !form.endDate) {
    return {
      isValid: false,
      error: "Vui lòng chọn ngày bắt đầu và kết thúc!",
    };
  }
  if (!form.conferenceCategoryId) {
    return { isValid: false, error: "Vui lòng chọn danh mục!" };
  }
  return { isValid: true };
};

// ============================================
// RESEARCH-SPECIFIC EXTENSIONS
// ============================================

export const validateResearchTimingConstraint = (
  ticketSaleStart: string,
  eventStartDate: string
): ValidationResult => {
  if (!ticketSaleStart || !eventStartDate) {
    return { isValid: true };
  }

  const saleStart = new Date(ticketSaleStart);
  const eventStart = new Date(eventStartDate);
  const daysBetween = Math.floor(
    (saleStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysBetween < 90) {
    return {
      isValid: true,
      warning: `⚠️ Chỉ còn ${daysBetween} ngày để hoàn thành Timeline nghiên cứu (Registration, Full Paper, Review, Revision, Camera Ready). Đảm bảo đủ thời gian!`,
    };
  }

  return { isValid: true };
};

export const validateResearchBasicForm = (form: ConferenceBasicForm) => {
  const nameResult = validateConferenceName(form.conferenceName);
  if (!nameResult.isValid) {
    toast.error(nameResult.error);
    return { isValid: false };
  }

  if (!form.description?.trim()) {
    toast.error("Vui lòng nhập mô tả hội thảo");
    return { isValid: false };
  }

  if (!form.startDate) {
    toast.error("Vui lòng chọn ngày bắt đầu sự kiện");
    return { isValid: false };
  }

  const rangeResult = validateDateRange(form.dateRange ?? 0);
  if (!rangeResult.isValid) {
    toast.error(rangeResult.error);
    return { isValid: false };
  }

  if (!form.endDate) {
    toast.error("Ngày kết thúc sự kiện chưa được tính toán");
    return { isValid: false };
  }

  const saleStartResult = validateTicketSaleStart(
    form.ticketSaleStart,
    form.startDate
  );
  if (!saleStartResult.isValid) {
    toast.error(saleStartResult.error);
    return { isValid: false };
  }

  const saleDurationResult = validateTicketSaleDuration(
    form.ticketSaleDuration ?? 0,
    form.ticketSaleStart,
    form.startDate
  );
  if (!saleDurationResult.isValid) {
    toast.error(saleDurationResult.error);
    return { isValid: false };
  }

  if (!form.ticketSaleEnd) {
    toast.error("Ngày kết thúc bán chưa được tính toán");
    return { isValid: false };
  }

  const totalResult = validateTotalSlot(form.totalSlot);
  if (!totalResult.isValid) {
    toast.error(totalResult.error);
    return { isValid: false };
  }

  if (!form.conferenceCategoryId) {
    toast.error("Vui lòng chọn danh mục hội thảo");
    return { isValid: false };
  }

  if (!form.cityId) {
    toast.error("Vui lòng chọn thành phố");
    return { isValid: false };
  }

  const saleStart = new Date(form.ticketSaleStart);
  const saleEnd = new Date(form.ticketSaleEnd);
  const eventStart = new Date(form.startDate);
  const eventEnd = new Date(form.endDate);

  if (saleStart >= saleEnd) {
    toast.error("Ngày bắt đầu bán phải trước ngày kết thúc bán");
    return { isValid: false };
  }

  if (saleEnd >= eventStart) {
    toast.error("Ngày kết thúc bán phải trước ngày bắt đầu sự kiện");
    return { isValid: false };
  }

  if (eventStart >= eventEnd) {
    toast.error("Ngày bắt đầu sự kiện phải trước ngày kết thúc sự kiện");
    return { isValid: false };
  }

  const timingWarning = validateResearchTimingConstraint(
    form.ticketSaleStart,
    form.startDate
  );
  if (timingWarning.warning) {
    toast.warning(timingWarning.warning);
  }

  toast.success("✅ Thông tin cơ bản hợp lệ!");
  return { isValid: true };
};
