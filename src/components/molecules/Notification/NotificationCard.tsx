// src/components/NotificationCard.tsx
import React from 'react';
import { Bell, Package, X } from 'lucide-react';
import { Notification } from '@/types/notification.type';

interface NotificationCardProps {
  notification: Notification;
  mode: 'dark' | 'light';
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  mode,
  onMarkAsRead,
  onDelete,
}) => {
  const isDark = mode === 'dark';

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'ORDER':
        return <Package className="w-5 h-5" />;
      case 'PROMOTION':
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'ORDER':
        return 'text-blue-500';
      case 'PROMOTION':
        return 'text-green-500';
      case 'SYSTEM':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isDark
          ? `${notification.readStatus ? 'bg-gray-800 border-gray-700' : 'bg-gray-750 border-gray-600'}`
          : `${notification.readStatus ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`
      } hover:shadow-md`}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${getTypeColor()}`}>
          {getTypeIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-sm ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {notification.title}
            </h3>
            <button
              onClick={() => onDelete(notification.notificationId)}
              className={`flex-shrink-0 p-1 rounded hover:bg-opacity-10 ${
                isDark ? 'hover:bg-white text-gray-400' : 'hover:bg-black text-gray-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p
            className={`text-sm mt-1 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              {formatDate(notification.createdAt)}
            </span>

            {!notification.readStatus && (
              <button
                onClick={() => onMarkAsRead(notification.notificationId)}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;