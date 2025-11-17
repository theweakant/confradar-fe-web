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
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const validatePhaseTime = (
  startDate?: string,
  endDate?: string
): PhaseValidationResult => {
  const now = new Date();

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