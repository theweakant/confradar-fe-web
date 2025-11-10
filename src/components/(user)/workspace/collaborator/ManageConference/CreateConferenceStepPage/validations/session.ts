import type { ValidationResult } from "./basic";

export const validateSessionTitle = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Tiêu đề không được để trống' };
  }
  if (value.trim().length < 5) {
    return { isValid: false, error: 'Tiêu đề phải có ít nhất 5 ký tự' };
  }
  return { isValid: true };
};

export const validateSessionDate = (
  date: string,
  eventStart: string,
  eventEnd: string
): ValidationResult => {
  if (!date) {
    return { isValid: false, error: 'Vui lòng chọn ngày' };
  }

  const sessionDate = new Date(date);
  const confStart = new Date(eventStart);
  const confEnd = new Date(eventEnd);

  sessionDate.setHours(0, 0, 0, 0);
  confStart.setHours(0, 0, 0, 0);
  confEnd.setHours(0, 0, 0, 0);

  if (sessionDate < confStart || sessionDate > confEnd) {
    return {
      isValid: false,
      error: `Phải trong khoảng ${confStart.toLocaleDateString('vi-VN')} - ${confEnd.toLocaleDateString('vi-VN')}`,
    };
  }

  return { isValid: true };
};

export const validateSessionTimeRange = (range: number): ValidationResult => {
  if (range < 0.5) {
    return { isValid: false, error: 'Thời lượng phải ít nhất 0.5 giờ' };
  }
  if (range > 12) {
    return { isValid: false, error: 'Thời lượng không quá 12 giờ' };
  }
  return { isValid: true };
};

export const validateSessionTime = (
  startTime: string,
  endTime: string
): ValidationResult => {
  if (!startTime || !endTime) {
    return { isValid: false, error: 'Vui lòng nhập thời gian bắt đầu và kết thúc' };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  if (durationMinutes < 0) {
    return {
      isValid: false,
      error: 'Thời gian kết thúc phải sau thời gian bắt đầu!',
    };
  }

  if (durationMinutes < 30) {
    return { isValid: false, error: 'Thời lượng phiên họp phải ít nhất 30 phút!' };
  }

  return { isValid: true };
};

export const validateSpeakerName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: 'Tên diễn giả không được để trống' };
  }
  if (value.trim().length < 2) {
    return { isValid: false, error: 'Tên diễn giả phải có ít nhất 2 ký tự' };
  }
  return { isValid: true };
};

export const validateRoomId = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Vui lòng chọn phòng' };
  }
  return { isValid: true };
};