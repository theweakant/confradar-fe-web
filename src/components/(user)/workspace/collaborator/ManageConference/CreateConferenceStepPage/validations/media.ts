import type { ValidationResult } from "./basic";

export const validateMediaFile = (file: File | null): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Vui lòng chọn file media' };
  }

  const maxSize = 4 * 1024 * 1024; // 4MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File không được vượt quá 4MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File phải là ảnh (JPG, PNG) hoặc video (MP4)',
    };
  }

  return { isValid: true };
};

export const validateMediaList = (mediaList: any[]): ValidationResult => {
  if (mediaList.length === 0) {
    return {
      isValid: true,
      warning: 'Chưa có media nào được thêm. Bạn có thể bỏ qua bước này.',
    };
  }

  const maxMedia = 10;
  if (mediaList.length > maxMedia) {
    return {
      isValid: false,
      error: `Không được thêm quá ${maxMedia} media`,
    };
  }

  return { isValid: true };
};