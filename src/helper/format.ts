import { format } from 'date-fns'

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}

//currency
export function formatCurrency(amount: number | undefined): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0)
}

export const truncateContent = (content: string, maxLength: number = 40): string => {
  if (!content) return "N/A"; 
  if (content.length <= maxLength) return content 

  const words = content.split(' ')
  let truncated = ''

  for (const word of words) {
    if ((truncated + word).length > maxLength) break
    truncated += (truncated ? ' ' : '') + word
  }

  return truncated.trim() + '...'
}

//date
export const formatDate = (date?: string |null) => {
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

 
//date time
export const formatDateTime = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss')
}


export function convertDuration(duration: string) {
  const [hours, minutes] = duration.split(':').map(Number)
  return `${hours + minutes / 60} hours`
}


//format request
export const parseDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  // Nếu format yyyy-mm-dd
  if (dateStr.includes('-')) {
    return new Date(dateStr);
  }
  // Nếu format dd/mm/yyyy
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  }
  return undefined;
};

// Helper để convert Date object sang yyyy-mm-dd
export const formatDateToAPI = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};