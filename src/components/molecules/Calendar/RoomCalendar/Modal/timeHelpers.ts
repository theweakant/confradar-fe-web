// utils/timeHelpers.ts

export const parseTimeToDate = (timeString: string, dateString?: string): Date | null => {
  if (!timeString || typeof timeString !== 'string') {
    return null;
  }

  // Case 1: ISO Date string (có chứa 'T')
  const isoDate = new Date(timeString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Case 2: Time-only format "HH:mm:ss"
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const baseDate = dateString ? new Date(dateString) : new Date();
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    
    const result = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours,
      minutes,
      seconds
    );
    
    return isNaN(result.getTime()) ? null : result;
  }

  return null;
};

/**
 * Format time để hiển thị: "14:30"
 */
export const formatTimeForDisplay = (timeString: string, dateString?: string): string => {
  const date = parseTimeToDate(timeString, dateString);
  
  if (!date) {
    return "--:--";
  }

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Convert ISO string sang "HH:mm:ss" format
 */
export const convertToTimeOnly = (isoString: string): string => {
  const date = new Date(isoString);
  
  if (isNaN(date.getTime())) {
    console.warn('Invalid ISO string:', isoString);
    return "00:00:00";
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Convert "HH:mm:ss" sang ISO string với ngày cụ thể
 */
export const convertTimeOnlyToISO = (timeOnly: string, dateString: string): string => {
  if (!timeOnly.match(/^\d{2}:\d{2}:\d{2}$/)) {
    console.warn('Invalid time-only format:', timeOnly);
    return new Date(dateString).toISOString();
  }

  const [hours, minutes, seconds] = timeOnly.split(':').map(Number);
  const date = new Date(dateString);
  date.setHours(hours, minutes, seconds, 0);
  
  return date.toISOString();
};

/**
 * Normalize time: chuyển về format chuẩn (ISO hoặc time-only tùy loại session)
 */
export const normalizeTime = (
  timeString: string, 
  dateString: string, 
  outputFormat: 'iso' | 'timeonly' = 'iso'
): string => {
  const date = parseTimeToDate(timeString, dateString);
  
  if (!date) {
    return outputFormat === 'iso' 
      ? new Date(dateString).toISOString() 
      : "00:00:00";
  }

  if (outputFormat === 'timeonly') {
    return convertToTimeOnly(date.toISOString());
  }

  return date.toISOString();
};

/**
 * Tính duration (phút) giữa 2 thời điểm
 */
export const calculateDurationMinutes = (
  startTime: string, 
  endTime: string, 
  dateString?: string
): number => {
  const start = parseTimeToDate(startTime, dateString);
  const end = parseTimeToDate(endTime, dateString);

  if (!start || !end) {
    return 0;
  }

  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60));
};

/**
 * Format duration thành "2h 30p"
 */
export const formatDuration = (startTime: string, endTime: string, dateString?: string): string => {
  const minutes = calculateDurationMinutes(startTime, endTime, dateString);
  
  if (minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h${mins > 0 ? ` ${mins}p` : ""}`;
};

/**
 * Kiểm tra 2 khoảng thời gian có trùng nhau không
 */
export const checkTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
  dateString: string
): boolean => {
  const s1 = parseTimeToDate(start1, dateString);
  const e1 = parseTimeToDate(end1, dateString);
  const s2 = parseTimeToDate(start2, dateString);
  const e2 = parseTimeToDate(end2, dateString);

  if (!s1 || !e1 || !s2 || !e2) {
    return false;
  }

  // Overlap nếu: start1 < end2 && start2 < end1
  return s1.getTime() < e2.getTime() && s2.getTime() < e1.getTime();
};

/**
 * Kiểm tra session có conflict với danh sách sessions khác không
 */
export const checkSessionConflict = <T extends { startTime: string; endTime: string; date: string; sessionId?: string }>(
  targetSession: T,
  existingSessions: T[],
  excludeSessionId?: string
): boolean => {
  return existingSessions.some(session => {
    // Bỏ qua chính session đang check
    if (excludeSessionId && session.sessionId === excludeSessionId) {
      return false;
    }

    // Chỉ check sessions cùng ngày
    if (session.date !== targetSession.date) {
      return false;
    }

    return checkTimeOverlap(
      targetSession.startTime,
      targetSession.endTime,
      session.startTime,
      session.endTime,
      targetSession.date
    );
  });
};

/**
 * Kiểm tra time có nằm trong time span không
 */
export const isTimeInSpan = (
  time: string,
  spanStart: string,
  spanEnd: string,
  dateString: string
): boolean => {
  const t = parseTimeToDate(time, dateString);
  const start = parseTimeToDate(spanStart, dateString);
  const end = parseTimeToDate(spanEnd, dateString);

  if (!t || !start || !end) {
    return false;
  }

  return t.getTime() >= start.getTime() && t.getTime() <= end.getTime();
};

/**
 * Kiểm tra session có fit vào time span không
 */
export const canFitInTimeSpan = (
  sessionStart: string,
  sessionEnd: string,
  spanStart: string,
  spanEnd: string,
  dateString: string
): boolean => {
  const sessStart = parseTimeToDate(sessionStart, dateString);
  const sessEnd = parseTimeToDate(sessionEnd, dateString);
  const spStart = parseTimeToDate(spanStart, dateString);
  const spEnd = parseTimeToDate(spanEnd, dateString);

  if (!sessStart || !sessEnd || !spStart || !spEnd) {
    return false;
  }

  // Session phải nằm hoàn toàn trong span
  return sessStart.getTime() >= spStart.getTime() && sessEnd.getTime() <= spEnd.getTime();
};

/**
 * Tạo ISO string từ date và time
 */
export const createISOFromDateTime = (dateString: string, timeString: string): string => {
  // Nếu timeString đã là ISO, trả về luôn
  const isoTest = new Date(timeString);
  if (!isNaN(isoTest.getTime()) && timeString.includes('T')) {
    return timeString;
  }

  // Nếu là time-only, ghép với date
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return convertTimeOnlyToISO(timeString, dateString);
  }

  // Fallback
  return new Date(dateString).toISOString();
};

/**
 * Format date để hiển thị: "Thứ Hai, 15/12/2024"
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Lấy format type của session (iso hoặc timeonly)
 */
export const detectTimeFormat = (timeString: string): 'iso' | 'timeonly' | 'unknown' => {
  if (!timeString || typeof timeString !== 'string') {
    return 'unknown';
  }

  // Check ISO format
  const isoTest = new Date(timeString);
  if (!isNaN(isoTest.getTime()) && timeString.includes('T')) {
    return 'iso';
  }

  // Check time-only format
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return 'timeonly';
  }

  return 'unknown';
};