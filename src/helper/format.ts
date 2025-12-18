import { format } from "date-fns";

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 10
): string => {
  if (!text) return "—"; 
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

//currency
export function formatCurrency(amount: number | undefined): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
}

export const truncateContent = (
  content: string,
  maxLength: number = 40,
): string => {
  if (!content) return "N/A";
  if (content.length <= maxLength) return content;

  const words = content.split(" ");
  let truncated = "";

  for (const word of words) {
    if ((truncated + word).length > maxLength) break;
    truncated += (truncated ? " " : "") + word;
  }

  return truncated.trim() + "...";
};

//date
export const formatDate = (date?: string |Date | null) => {
  if (!date) return "-";

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatTimeDate = (date?: string): string => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const hours = String(d.getHours());
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${hours}h${minutes} ${day}/${month}/${year}`;
};

export const formatTimeOnly = (isoString: string): string => {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-GB", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit",
    hour12: false 
  }); 
};

  export const extractTimeOnly = (isoString: string): string => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return "00:00:00";
    }

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  export const extractTimeOnly2 = (isoString: string): string => {
    if (isoString.includes('T')) {
      const timePart = isoString.split('T')[1];
      if (timePart) {
        const cleanTime = timePart.split('+')[0].split('-')[0].split('Z')[0];
        return cleanTime.substring(0, 8); // "08:00:00"
      }
    }
    return "00:00:00";
};

export const validateTimeFormat = (time: string): string => {
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }
    try {
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  } catch (e) {
    console.error("❌ Invalid time format:", time);
  }
  
  return "00:00:00";
};

export const formatDateTime = (date: string): string => {
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss");
};

export function convertDuration(duration: string) {
  const [hours, minutes] = duration.split(":").map(Number);
  return `${hours + minutes / 60} hours`;
}

//format request
export const parseDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  // Nếu format yyyy-mm-dd
  if (dateStr.includes("-")) {
    return new Date(dateStr);
  }
  // Nếu format dd/mm/yyyy
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
  }
  return undefined;
};

// Helper để convert Date object sang yyyy-mm-dd
export const formatDateToAPI = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Thời gian cục bộ (local) – không convert timezone
export const formatLocalTime = (datetimeString?: string): string => {
  if (!datetimeString) return "-";

  const timePart = datetimeString.split("T")[1];
  if (!timePart) return "-";

  const [hours, minutes] = timePart.split(":");
  if (!hours || !minutes) return "-";

  return `${parseInt(hours, 10)}h${minutes}`;
};

export const formatLocalTimeRange = (
  startTime?: string,
  endTime?: string
): string => {
  if (!startTime || !endTime) return "-";

  const startFormatted = formatLocalTime(startTime);
  const endFormatted = formatLocalTime(endTime);

  return `${startFormatted} – ${endFormatted}`;
};


export  const normalizeTimeFormat = (time: string): string => {
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  try {
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  } catch (e) {
    console.error("❌ Invalid time format:", time);
  }
  
  return "00:00:00";
};

export const normalizeDateFormat = (dateOrIso: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOrIso)) {
    return dateOrIso;
  }
  
  try {
    const date = new Date(dateOrIso);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error("❌ Invalid date format:", dateOrIso);
  }
  
  return new Date().toISOString().split('T')[0];
};