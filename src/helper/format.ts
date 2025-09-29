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

//date
export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

 
//date time
export const formatDateTime = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss')
}


export function convertDuration(duration: string) {
  const [hours, minutes] = duration.split(':').map(Number)
  return `${hours + minutes / 60} hours`
}


export const truncateContent = (content: string, maxLength: number = 40): string => {
  if (content.length <= maxLength) return content // Trả về nguyên nội dung nếu nó ngắn hơn maxLength

  const words = content.split(' ')
  let truncated = ''

  for (const word of words) {
    if ((truncated + word).length > maxLength) break
    truncated += (truncated ? ' ' : '') + word
  }

  return truncated.trim() + '...'
}

