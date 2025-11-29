// researchBasic.ts (hoặc tên file bạn đang dùng)

import { toast } from "sonner";
import type { ConferenceBasicForm } from "@/types/conference.type";
import type { ValidationResult } from "../basic"; // Đảm bảo ValidationResult có: { isValid: boolean; error?: string; warning?: string }

// ============================================
// INDIVIDUAL FIELD VALIDATORS (Pure, no side effects)
// ============================================

export const validateConferenceName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Tên hội nghị không được để trống" };
  }
  if (name.trim().length < 10) {
    return { isValid: false, error: "Tên hội nghị phải có ít nhất 10 ký tự" };
  }
  return { isValid: true };
};

export const validateDateRange = (dateRange: number): ValidationResult => {
  if (!dateRange || dateRange <= 0) {
    return { isValid: false, error: "Số ngày diễn ra phải lớn hơn 0" };
  }
  if (dateRange > 365) {
    return { isValid: false, error: "Số ngày diễn ra không được vượt quá 365 ngày" };
  }
  return { isValid: true };
};

export const validateTotalSlot = (totalSlot: number): ValidationResult => {
  if (!totalSlot || totalSlot <= 0) {
    return { isValid: false, error: "Số lượng tham dự phải lớn hơn 0" };
  }
  return { isValid: true };
};

export const validateTicketSaleStart = (
  ticketSaleStart: string,
  eventStartDate: string
): ValidationResult => {
  if (!ticketSaleStart) {
    return { isValid: false, error: "Vui lòng chọn ngày bắt đầu bán" };
  }
  if (!eventStartDate) {
    return { isValid: true }; // Skip if event date not set
  }

  const saleStart = new Date(ticketSaleStart);
  const eventStart = new Date(eventStartDate);

  if (saleStart >= eventStart) {
    return { isValid: false, error: "Ngày bắt đầu bán phải trước ngày bắt đầu sự kiện" };
  }

  // Optional: add warning for short notice
  const daysDiff = Math.floor(
    (eventStart.getTime() - saleStart.getTime()) / (1000 * 60 * 60 * 24)
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
  ticketSaleStart: string,
  eventStartDate: string
): ValidationResult => {
  if (!duration || duration <= 0) {
    return { isValid: false, error: "Số ngày bán phải lớn hơn 0" };
  }
  if (!ticketSaleStart || !eventStartDate) {
    return { isValid: true }; // Skip if dates not ready
  }

  const saleStart = new Date(ticketSaleStart);
  const saleEnd = new Date(saleStart);
  saleEnd.setDate(saleStart.getDate() + duration); // End = start + duration (so duration=1 → same day)

  const eventStart = new Date(eventStartDate);

  if (saleEnd >= eventStart) {
    return { isValid: false, error: "Ngày kết thúc bán phải trước ngày bắt đầu sự kiện" };
  }

  return { isValid: true };
};

// ============================================
// RESEARCH-SPECIFIC VALIDATORS
// ============================================

export const validateResearchTimingConstraint = (
  ticketSaleStart: string,
  eventStartDate: string
): ValidationResult => {
  if (!ticketSaleStart || !eventStartDate) {
    return { isValid: true };
  }

  const saleStart = new Date(ticketSaleStart);
  const now = new Date();

  const daysUntilSale = Math.floor(
    (saleStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilSale < 90) {
    return {
      isValid: true,
      warning: `⚠️ Chỉ còn ${daysUntilSale} ngày để hoàn thành Timeline nghiên cứu (Registration, Full Paper, Review, Revision, Camera Ready). Đảm bảo đủ thời gian!`,
    };
  }

  return { isValid: true };
};

// ============================================
// FULL FORM VALIDATOR (with toast)
// ============================================

export const validateResearchBasicForm = (form: ConferenceBasicForm): { isValid: boolean; errors: Record<string, string> } => {
  // 1. Conference Name
  const nameValidation = validateConferenceName(form.conferenceName);
  if (!nameValidation.isValid) {
    toast.error(nameValidation.error!);
    return { isValid: false, errors: { conferenceName: nameValidation.error! } };
  }

  // 2. Description
  if (!form.description || form.description.trim().length === 0) {
    toast.error("Vui lòng nhập mô tả hội nghị");
    return { isValid: false, errors: { description: "Không được để trống" } };
  }

  // 3. Start Date
  if (!form.startDate) {
    toast.error("Vui lòng chọn ngày bắt đầu sự kiện");
    return { isValid: false, errors: { startDate: "Không được để trống" } };
  }

  // 4. Date Range
  const dateRangeValidation = validateDateRange(form.dateRange ?? 0);
  if (!dateRangeValidation.isValid) {
    toast.error(dateRangeValidation.error!);
    return { isValid: false, errors: { dateRange: dateRangeValidation.error! } };
  }

  // 5. End Date
  if (!form.endDate) {
    toast.error("Ngày kết thúc sự kiện chưa được tính toán");
    return { isValid: false, errors: { endDate: "Lỗi tính toán ngày" } };
  }

  // 6. Ticket Sale Start
  const ticketSaleStartValidation = validateTicketSaleStart(form.ticketSaleStart, form.startDate);
  if (!ticketSaleStartValidation.isValid) {
    toast.error(ticketSaleStartValidation.error!);
    return { isValid: false, errors: { ticketSaleStart: ticketSaleStartValidation.error! } };
  }

  // 7. Ticket Sale Duration
  const ticketSaleDurationValidation = validateTicketSaleDuration(
    form.ticketSaleDuration ?? 0,
    form.ticketSaleStart,
    form.startDate
  );
  if (!ticketSaleDurationValidation.isValid) {
    toast.error(ticketSaleDurationValidation.error!);
    return { isValid: false, errors: { ticketSaleDuration: ticketSaleDurationValidation.error! } };
  }

  // 8. Ticket Sale End
  if (!form.ticketSaleEnd) {
    toast.error("Ngày kết thúc bán vé chưa được tính toán");
    return { isValid: false, errors: { ticketSaleEnd: "Lỗi tính toán ngày" } };
  }

  // 9. Total Slot
  const totalSlotValidation = validateTotalSlot(form.totalSlot);
  if (!totalSlotValidation.isValid) {
    toast.error(totalSlotValidation.error!);
    return { isValid: false, errors: { totalSlot: totalSlotValidation.error! } };
  }

  // 10. Category
  if (!form.conferenceCategoryId) {
    toast.error("Vui lòng chọn danh mục hội nghị");
    return { isValid: false, errors: { conferenceCategoryId: "Vui lòng chọn danh mục" } };
  }

  // 11. City
  if (!form.cityId) {
    toast.error("Vui lòng chọn thành phố");
    return { isValid: false, errors: { cityId: "Vui lòng chọn thành phố" } };
  }

  // 12. Cross-field date validation
  const saleStart = new Date(form.ticketSaleStart);
  const saleEnd = new Date(form.ticketSaleEnd);
  const eventStart = new Date(form.startDate);
  const eventEnd = new Date(form.endDate);

  if (saleStart >= saleEnd) {
    toast.error("Ngày bắt đầu bán phải trước ngày kết thúc bán");
    return { isValid: false, errors: { ticketSaleStart: "Lỗi thứ tự ngày" } };
  }

  if (saleEnd >= eventStart) {
    toast.error("Ngày kết thúc bán phải trước ngày bắt đầu sự kiện");
    return { isValid: false, errors: { ticketSaleEnd: "Lỗi thứ tự ngày" } };
  }

  if (eventStart >= eventEnd) {
    toast.error("Ngày bắt đầu sự kiện phải trước ngày kết thúc sự kiện");
    return { isValid: false, errors: { startDate: "Lỗi thứ tự ngày" } };
  }

  // 13. Warning (non-blocking)
  const timingWarning = validateResearchTimingConstraint(form.ticketSaleStart, form.startDate);
  if (timingWarning.warning) {
    toast.warning(timingWarning.warning);
  }

  toast.success("✅ Thông tin cơ bản hợp lệ!");
  return { isValid: true, errors: {} };
};

