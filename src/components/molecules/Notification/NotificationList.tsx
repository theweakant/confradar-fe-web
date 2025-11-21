// src/components/NotificationList.tsx
import React from 'react';
import { Bell } from 'lucide-react';
import NotificationCard from './NotificationCard';
import { Notification } from '@/types/notification.type';

interface NotificationListProps {
  notifications: Notification[];
  mode: 'dark' | 'light';
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  mode,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
}) => {
  const isDark = mode === 'dark';
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className={`rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Thông báo
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              Đọc tất cả
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationCard
              key={notification.notificationId}
              notification={notification}
              mode={mode}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;