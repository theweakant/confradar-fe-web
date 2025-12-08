import { useGlobalTime } from "@/utils/TimeContext";

// Helper functions for phase time validation
export interface PhaseValidationResult {
  isAvailable: boolean;
  isExpired: boolean;
  isPending: boolean;
  daysRemaining?: number;
  daysUntilStart?: number;
  message: string;
  startDate?: string;
  endDate?: string;
  formattedPeriod?: string;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit'
  });
};

export const validatePhaseTime = (
  startDate?: string,
  endDate?: string,
  now: Date = new Date()
): PhaseValidationResult => {
  // const { now } = useGlobalTime();

  if (!startDate || !endDate) {
    return {
      isAvailable: false,
      isExpired: false,
      isPending: true,
      message: "Thông tin thời gian chưa được cập nhật"
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const formattedPeriod = `${formatDate(start)} - ${formatDate(end)}`;

  // Check if current time is before start time
  if (now < start) {
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      isAvailable: false,
      isExpired: false,
      isPending: true,
      daysUntilStart,
      startDate,
      endDate,
      formattedPeriod,
      message: `Chưa đến thời gian. Còn ${daysUntilStart} ngày để bắt đầu giai đoạn này.`
    };
  }

  // Check if current time is after end time
  if (now > end) {
    return {
      isAvailable: false,
      isExpired: true,
      isPending: false,
      startDate,
      endDate,
      formattedPeriod,
      message: "Bạn đã hết hạn thao tác cho giai đoạn bài báo này."
    };
  }

  // Current time is within the valid period
  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    isAvailable: true,
    isExpired: false,
    isPending: false,
    daysRemaining,
    startDate,
    endDate,
    formattedPeriod,
    message: `Bạn còn ${daysRemaining} ngày để thao tác.`
  };
};

export function parseStartOfDay(date?: string | Date): Date | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return undefined;
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseEndOfDay(date?: string | Date): Date | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return undefined;
  d.setHours(23, 59, 59, 999);
  return d;
}

export interface TimeRemaining {
  days: number;
  hours: number;
}

// export function getTimeRemaining(endDate: Date | string): TimeRemaining {
//   const { now } = useGlobalTime();

//   const end = endDate instanceof Date ? endDate : new Date(endDate);
//   if (isNaN(end.getTime())) return { days: 0, hours: 0 };

//   let diffMs = end.getTime() - now.getTime();
//   if (diffMs <= 0) return { days: 0, hours: 0 };

//   const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//   diffMs -= days * 24 * 60 * 60 * 1000;

//   const hours = Math.floor(diffMs / (1000 * 60 * 60));

//   return { days, hours };
// }


// export function getTimeRemaining(endDate: Date | string, now: Date = new Date()): TimeRemaining {
//   const end = endDate instanceof Date ? endDate : new Date(endDate);
//   if (isNaN(end.getTime())) return { days: 0, hours: 0 };

//   let diffMs = end.getTime() - now.getTime();
//   if (diffMs <= 0) return { days: 0, hours: 0 };

//   const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
//   diffMs -= days * 24 * 60 * 60 * 1000;

//   const hours = Math.floor(diffMs / (1000 * 60 * 60));

//   return { days, hours };
// }