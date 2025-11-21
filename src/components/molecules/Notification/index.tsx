// src/components/NotificationSystem/index.tsx
import React, { useState } from 'react';
import NotificationList from './NotificationList';
import { Notification } from '@/types/notification.type';

// 👇 Mock data — nên thay bằng API/Redux sau này
const mockNotifications: Notification[] = [
  {
    notificationId: 'noti_001',
    userId: 'user_123',
    title: 'Hội nghị mới phù hợp với bạn',
    message: 'International Conference on Artificial Intelligence 2025 đang mở đăng ký. Deadline: 15/12/2025.',
    type: 'SYSTEM',
    createdAt: '2025-11-21T10:15:30.000Z',
    readStatus: false,
  },
  {
    notificationId: 'noti_002',
    userId: 'user_123',
    title: 'Nhắc nhở: Deadline sắp hết hạn',
    message: 'Hạn nộp bài cho ICSE 2026 còn 3 ngày. Đừng bỏ lỡ cơ hội này!',
    type: 'SYSTEM',
    createdAt: '2025-11-20T14:30:00.000Z',
    readStatus: false,
  },
  {
    notificationId: 'noti_003',
    userId: 'user_123',
    title: 'Hội nghị bạn theo dõi có cập nhật',
    message: 'CVPR 2026 đã công bố chủ đề mới: Computer Vision for Healthcare. Xem chi tiết.',
    type: 'SYSTEM',
    createdAt: '2025-11-19T09:00:00.000Z',
    readStatus: false,
  },
  {
    notificationId: 'noti_004',
    userId: 'user_123',
    title: 'Kết quả tìm kiếm của bạn',
    message: 'Tìm thấy 15 hội nghị về Machine Learning trong tháng 12/2025. Xem danh sách.',
    type: 'SYSTEM',
    createdAt: '2025-11-18T16:45:00.000Z',
    readStatus: true,
  },
  {
    notificationId: 'noti_005',
    userId: 'user_123',
    title: 'Lời mời tham gia hội nghị',
    message: 'Bạn được mời làm reviewer cho ACM SIGMOD 2026. Vui lòng xác nhận trước 30/11/2025.',
    type: 'SYSTEM',
    createdAt: '2025-11-17T11:20:00.000Z',
    readStatus: true,
  },
  {
    notificationId: 'noti_006',
    userId: 'user_123',
    title: 'Hội nghị được xác nhận',
    message: 'Đăng ký tham dự NeurIPS 2025 của bạn đã được xác nhận. Mã đăng ký: #NRS2025-4567.',
    type: 'SYSTEM',
    createdAt: '2025-11-16T08:30:00.000Z',
    readStatus: true,
  },
  {
    notificationId: 'noti_007',
    userId: 'user_123',
    title: 'Bài báo của bạn được chấp nhận',
    message: 'Chúc mừng! Bài báo "Deep Learning for Medical Imaging" đã được chấp nhận tại MICCAI 2026.',
    type: 'SYSTEM',
    createdAt: '2025-11-15T15:45:00.000Z',
    readStatus: true,
  },
];

const NotificationSystem: React.FC = () => {
  const [mode, setMode] = useState<'dark' | 'light'>('light');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.notificationId === id ? { ...n, readStatus: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.notificationId !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Tính số thông báo chưa đọc — để dùng ở layout nếu cần
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className={`min-h-screen p-6 transition-colors ${mode === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="w-full mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Hệ thống thông báo
          </h1>
          <button
            onClick={toggleMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <NotificationList
          notifications={notifications}
          mode={mode}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
    </div>
  );
};

export default NotificationSystem;