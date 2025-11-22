export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'SYSTEM' | 'PROMOTION';
  createdAt: string;
  readStatus: boolean;
}