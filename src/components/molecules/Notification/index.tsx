import React, { useState } from 'react';
import { useGetOwnNotificationsQuery } from '@/redux/services/user.service';
import { Notification } from '@/types/notification.type';
import { Bell, User, Sun, Moon } from 'lucide-react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

interface NotificationSystemProps {
  mode?: 'light' | 'dark';
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ mode: initialMode = 'light' }) => {
  const { data, isLoading, isError } = useGetOwnNotificationsQuery();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);

  const isDark = mode === 'dark';

  if (isLoading) {
    return (
      <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Đang tải thông báo...
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="text-red-500">Không thể tải thông báo.</div>
      </div>
    );
  }

  const allNotifications: Notification[] = data.data;
  
  const notifications = filter === 'unread' 
    ? allNotifications.filter(n => !n.readStatus)
    : allNotifications;
  
  const unreadCount = allNotifications.filter(n => !n.readStatus).length;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Thông Báo
            </h1>
            
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setMode(prev => prev === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4">
              <button 
                onClick={() => setFilter('all')}
                className={`text-sm font-medium ${
                  filter === 'all' 
                    ? (isDark ? 'text-white' : 'text-gray-900')
                    : (isDark ? 'text-gray-500' : 'text-gray-400')
                }`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={`text-sm font-medium ${
                  filter === 'unread' 
                    ? (isDark ? 'text-white' : 'text-gray-900')
                    : (isDark ? 'text-gray-500' : 'text-gray-400')
                }`}
              >
                Chưa đọc
              </button>
            </div>
            
            {/* Nút Đọc tất cả */}
            {unreadCount > 0 && (
              <button 
                onClick={() => {
                  console.log('Mark all as read');
                }}
                className={`text-xs font-medium ${
                  isDark 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Đọc tất cả ({unreadCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Không có thông báo nào</p>
        </div>
      ) : (
        <div className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
          {notifications.map((notif) => (
            <div
              key={notif.notificationId}
              className={`px-4 py-4 transition-colors cursor-pointer ${
                !notif.readStatus 
                  ? (isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100')
                  : (isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50')
              }`}
            >
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <User className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {notif.title}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    
                    {!notif.readStatus && (
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>

                  <div className="my-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      isDark 
                        ? 'bg-purple-900 text-purple-300' 
                        : 'bg-purple-100 text-purple-500'
                    }`}>
                      {notif.type || 'Type N/A'}
                    </span>
                  </div>

                  <p className={`text-sm line-clamp-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-800'
                  }`}>
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;