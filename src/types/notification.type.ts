export interface Notification {
  notificationId: string;
  userId?: string; // optional vì API response không có (hoặc có thể có sau)
  title: string;
  message: string;
  type: string | null; // ← API trả về null, nên không dùng enum cứng
  createdAt: string;   // ISO string, ví dụ: "2025-11-22T20:28:06.666"
  readStatus: boolean;
}