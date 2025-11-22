import React, { useState, useEffect } from 'react';

// ============= MOCK DATA =============
const mockData = {
  conferences: {
    total: 24,
    ready: 10,
    inProgress: 12,
    pending: 2,
  },
  revenueByMonth: [
    { month: 'T6', revenue: 45000000 },
    { month: 'T7', revenue: 78000000 },
    { month: 'T8', revenue: 62000000 },
    { month: 'T9', revenue: 95000000 },
    { month: 'T10', revenue: 58000000 },
    { month: 'T11', revenue: 82000000 },
  ],
  upcomingConference: {
    name: 'Tech Summit Vietnam 2024',
    time: '02:00 pm - 04:00 pm',
    date: '2024-11-25',
  },
  topConferences: [
    { id: 1, name: 'AI & Machine Learning Conference', registrations: 450, status: 'Completed', avatar: '🤖' },
    { id: 2, name: 'Cloud Computing Summit', registrations: 380, status: 'In Progress', avatar: '☁️' },
    { id: 3, name: 'DevOps Best Practices', registrations: 320, status: 'Ready', avatar: '🚀' },
    { id: 4, name: 'Cybersecurity Forum', registrations: 290, status: 'In Progress', avatar: '🔒' },
  ],
};

// ============= INTERFACES =============
interface ConferenceStatsProps {
  total: number;
  ready: number;
  inProgress: number;
  pending: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

interface UpcomingConference {
  name: string;
  time: string;
  date: string;
}

interface ReminderProps {
  conference: UpcomingConference;
}

interface Conference {
  id: number;
  name: string;
  registrations: number;
  status: string;
  avatar: string;
}

interface TopConferencesProps {
  conferences: Conference[];
}

interface ProgressProps {
  completed: number;
  inProgress: number;
  pending: number;
}

// ============= COMPONENTS =============

// 1. Conference Stats Component
const ConferenceStats: React.FC<ConferenceStatsProps> = ({ total, ready, inProgress, pending }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium opacity-90">Tổng Hội Nghị</h3>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">↗</span>
          </div>
        </div>
        <div className="text-5xl font-bold mb-2">{total}</div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-600">Đã Hoàn Thành</h3>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg">↗</span>
          </div>
        </div>
        <div className="text-5xl font-bold mb-2 text-gray-900">{ready}</div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-600">Đang Diễn Ra</h3>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg">↗</span>
          </div>
        </div>
        <div className="text-5xl font-bold mb-2 text-gray-900">{inProgress}</div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-600">Đang Chờ Duyệt</h3>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg">↗</span>
          </div>
        </div>
        <div className="text-5xl font-bold mb-2 text-gray-900">{pending}</div>
      </div>
    </div>
  );
};

// 2. Revenue Chart Component
const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Doanh Thu Theo Tháng</h3>
      <div className="flex items-end justify-between h-48 gap-3">
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;
          const isEven = index % 2 === 0;
          
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-full flex items-end">
                <div 
                  className={`w-full rounded-t-lg transition-all ${
                    isEven ? 'bg-emerald-600' : 'bg-emerald-400'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${item.revenue.toLocaleString('vi-VN')} VNĐ`}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-600">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Reminder Component
const UpcomingReminder: React.FC<ReminderProps> = ({ conference }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Nhắc Nhở</h3>
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">{conference.name}</h4>
        <p className="text-sm text-gray-500">Thời gian: {conference.time}</p>
      </div>
      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <span className="text-lg">▶</span>
        Xem lịch
      </button>
    </div>
  );
};

// 4. Top Conferences Component
const TopConferences: React.FC<TopConferencesProps> = ({ conferences }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Ready': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed': return 'Hoàn thành';
      case 'In Progress': return 'Đang diễn ra';
      case 'Ready': return 'Sẵn sàng';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Hội Nghị</h3>
      </div>
      <div className="space-y-3">
        {conferences.map((conf) => (
          <div key={conf.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl">
              {conf.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate">{conf.name}</h4>
              <p className="text-xs text-gray-500">{conf.registrations} đăng ký</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conf.status)}`}>
              {getStatusText(conf.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Conference Progress Component
const ConferenceProgress: React.FC<ProgressProps> = ({ completed, inProgress, pending }) => {
  const total = completed + inProgress + pending;
  const completedPercent = Math.round((completed / total) * 100);
  const progressAngle = (completedPercent / 100) * 360;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">Tiến Trình Hội Nghị</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="20"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#059669"
              strokeWidth="20"
              strokeDasharray={`${(progressAngle / 360) * 502.4} 502.4`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-900">{completedPercent}%</div>
            <div className="text-sm text-gray-500">Đã kết thúc</div>
          </div>
        </div>
        
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
            <span className="text-gray-700">Hoàn thành ({completed})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-800"></div>
            <span className="text-gray-700">Đang diễn ra ({inProgress})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-gray-700">Đang chờ ({pending})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= MAIN DASHBOARD =============
export default function ConferenceDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Quản Lý Hội Nghị</h1>
        
        <ConferenceStats
          total={mockData.conferences.total}
          ready={mockData.conferences.ready}
          inProgress={mockData.conferences.inProgress}
          pending={mockData.conferences.pending}
        />

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <RevenueChart data={mockData.revenueByMonth} />
          </div>
          <UpcomingReminder conference={mockData.upcomingConference} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <TopConferences conferences={mockData.topConferences} />
          <ConferenceProgress
            completed={mockData.conferences.ready}
            inProgress={mockData.conferences.inProgress}
            pending={mockData.conferences.pending}
          />
        </div>
      </div>
    </div>
  );
}