import type { ValidationResult } from "./basic";
import { Sponsor } from "@/types/conference.type";

export const validateSponsorName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Tên nhà tài trợ không được để trống' };
  }
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Tên nhà tài trợ phải có ít nhất 2 ký tự' };
  }
  if (value.trim().length > 100) {
    return { isValid: false, error: 'Tên nhà tài trợ không được vượt quá 100 ký tự' };
  }
  return { isValid: true };
};

export const validateSponsorImage = (file: File | null): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Vui lòng chọn logo nhà tài trợ' };
  }

  const maxSize = 4 * 1024 * 1024; // 4MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File không được vượt quá 4MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File phải là ảnh (JPG, PNG)' };
  }

  return { isValid: true };
};

export const validateSponsorList = (sponsors: Sponsor[]): ValidationResult => {
  if (sponsors.length === 0) {
    return {
      isValid: true,
      warning: 'Chưa có nhà tài trợ nào. Bạn có thể bỏ qua bước này.',
    };
  }

  const maxSponsors = 20;
  if (sponsors.length > maxSponsors) {
    return {
      isValid: false,
      error: `Không được thêm quá ${maxSponsors} nhà tài trợ`,
    };
  }

  return { isValid: true };
};