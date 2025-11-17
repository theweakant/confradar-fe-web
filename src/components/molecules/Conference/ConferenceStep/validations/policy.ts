import type { RefundPolicy } from "@/types/conference.type";
import type { ValidationResult } from "./basic";

export const validatePolicyName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Tên chính sách không được để trống' };
  }
  if (value.trim().length < 3) {
    return { isValid: false, error: 'Tên chính sách phải có ít nhất 3 ký tự' };
  }
  return { isValid: true };
};

export const validateRefundPercent = (percent: number): ValidationResult => {
  if (percent <= 0 || percent > 100) {
    return { isValid: false, error: 'Phần trăm phải từ 1-100%' };
  }
  return { isValid: true };
};

export const validateRefundDeadline = (
  deadline: string,
  eventStart: string
): ValidationResult => {
  if (!deadline) {
    return { isValid: false, error: 'Vui lòng chọn hạn hoàn tiền' };
  }

  const refundDate = new Date(deadline);
  const eventDate = new Date(eventStart);

  if (refundDate >= eventDate) {
    return { isValid: false, error: 'Hạn phải trước ngày sự kiện' };
  }

  return { isValid: true };
};

export const validateRefundOrder = (
  order: number,
  existingPolicies: RefundPolicy[]
): ValidationResult => {
  if (order < 1) {
    return { isValid: false, error: 'Thứ tự phải lớn hơn 0' };
  }

  const isDuplicate = existingPolicies.some((p) => p.refundOrder === order);
  if (isDuplicate) {
    return { isValid: false, error: 'Thứ tự đã tồn tại' };
  }

  return { isValid: true };
};

export const validateRefundDeadlineInSalePeriod = (
  deadline: string,
  ticketSaleStart: string,
  ticketSaleEnd: string
): ValidationResult => {
  if (!deadline) {
    return { isValid: false, error: 'Vui lòng chọn hạn hoàn tiền' };
  }

  const refundDate = new Date(deadline);
  const saleStart = new Date(ticketSaleStart);
  const saleEnd = new Date(ticketSaleEnd);

  if (refundDate < saleStart || refundDate > saleEnd) {
    return {
      isValid: false,
      error: `Hạn hoàn tiền phải trong khoảng ${saleStart.toLocaleDateString('vi-VN')} - ${saleEnd.toLocaleDateString('vi-VN')}`,
    };
  }

  return { isValid: true };
};