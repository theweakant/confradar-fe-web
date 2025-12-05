import React from 'react';
import { TrendingUp, Calendar, Users } from 'lucide-react';
import {
  useGetConferencesGroupByStatusQuery,
  useGetRevenueStatsQuery,
  useGetUpcomingConferencesQuery,
  useGetTopRegisteredConferencesQuery,
} from '@/redux/services/dashboard.service';
import { formatCurrency } from '@/helper/format';
import { useAuth } from '@/redux/hooks/useAuth';

interface ConferenceStatsProps {
  total: number;
  completed: number;
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
  date: string;
}

interface ReminderProps {
  conference: UpcomingConference;
}

interface Conference {
  id: string;
  name: string;
  registrations: number;
  totalSlot: number;
  occupancyRate: number;
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

const ConferenceStats: React.FC<ConferenceStatsProps> = ({ total, completed, inProgress, pending }) => {
  return (
    <div className="grid grid-cols-4 gap-5 mb-6">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-md">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-medium opacity-90">Tổng Hội Nghị</h3>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="text-5xl font-bold mb-1">{total}</div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-medium text-gray-600">Đã Hoàn Thành</h3>
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp size={18} className="text-gray-600" />
          </div>
        </div>
        <div className="text-5xl font-bold mb-1 text-gray-900">{completed}</div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-medium text-gray-600">Đang Diễn Ra</h3>
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp size={18} className="text-gray-600" />
          </div>
        </div>
        <div className="text-5xl font-bold mb-1 text-gray-900">{inProgress}</div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-medium text-gray-600">Đang Chờ Duyệt</h3>
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp size={18} className="text-gray-600" />
          </div>
        </div>
        <div className="text-5xl font-bold mb-1 text-gray-900">{pending}</div>
      </div>
    </div>
  );
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxRevenue = data.length ? Math.max(...data.map(d => d.revenue)) : 1;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">Doanh Thu Theo Tháng</h3>
      <div className="flex items-end justify-between h-56 gap-2">
        {data.map((item, index) => {
          const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          return (
            <div key={`revenue-bar-${index}`} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full h-full flex items-end relative">
                {index % 2 === 0 && (
                  <div className="absolute inset-0 bg-gray-100/50 rounded-t-2xl" style={{ height: '100%' }}></div>
                )}
                <div
                  className="w-full rounded-2xl transition-all bg-emerald-500 relative z-10"
                  style={{ height: `${height}%` }}
                  title={formatCurrency(item.revenue)}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UpcomingReminder: React.FC<ReminderProps> = ({ conference }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">Nhắc Nhở</h3>
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">{conference.name}</h4>
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Calendar size={16} />
          Ngày: {new Date(conference.date).toLocaleDateString('vi-VN')}
        </p>
      </div>
      <div className="w-full bg-emerald-500 text-white font-medium py-3 px-4 rounded-2xl text-center">
        Sắp diễn ra
      </div>
    </div>
  );
};

const TopConferences: React.FC<TopConferencesProps> = ({ conferences }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hội nghị/ hội thảo được tham dự nhiều nhất</h3>
      </div>
      <div className="space-y-4">
        {conferences.map((conf) => (
          <div key={conf.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
              📊
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate mb-1">{conf.name}</h4>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Users size={12} />
                {conf.registrations} đăng ký ({conf.occupancyRate.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConferenceProgress: React.FC<ProgressProps> = ({ completed, inProgress, pending }) => {
  const total = completed + inProgress + pending;
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressAngle = (completedPercent / 100) * 360;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold mb-8 text-gray-900">Tiến Trình</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-52 h-52 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="104" cy="104" r="85" fill="none" stroke="#f3f4f6" strokeWidth="22" />
            <circle
              cx="104"
              cy="104"
              r="85"
              fill="none"
              stroke="#10b981"
              strokeWidth="22"
              strokeDasharray={`${(progressAngle / 360) * 534} 534`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-900">{completedPercent}%</div>
            <div className="text-sm text-gray-500 mt-1">Đã kết thúc</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-700">Hoàn thành</span>
            </div>
            <span className="font-semibold text-gray-900">{completed}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-800"></div>
              <span className="text-gray-700">Đang diễn ra</span>
            </div>
            <span className="font-semibold text-gray-900">{inProgress}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-gray-700">Đang chờ</span>
            </div>
            <span className="font-semibold text-gray-900">{pending}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= MAIN DASHBOARD =============
export default function ConferenceDashboard() {
  const { user } = useAuth();
  const userId = user?.userId || '';

  const { data: groupByStatusData } = useGetConferencesGroupByStatusQuery(userId, {
    skip: !userId,
  });

  const { data: revenueData } = useGetRevenueStatsQuery(
    { userId, monthBack: 6 },
    { skip: !userId }
  );

  const { data: upcomingData } = useGetUpcomingConferencesQuery(
    { userId, nextMonths: 3 },
    { skip: !userId }
  );

  const { data: topData } = useGetTopRegisteredConferencesQuery(
    { userId, numberToTake: 4 },
    { skip: !userId }
  );

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  // --- Transform status logic ---
  let completed = 0;      // "Completed"
  let inProgress = 0;     // "Preparing", "Ready", "OnHold"
  let pending = 0;        // "Pending"
  // "Draft" → bỏ qua hoàn toàn

  const groupByStatus = groupByStatusData?.data?.groupByStatus || [];

  groupByStatus.forEach((group) => {
    const count = group.count;
    const status = group.groupName;

    // Bỏ qua "Draft"
    if (status === 'Draft') {
      return;
    }

    switch (status) {
      case 'Completed':
        completed = count;
        break;
      case 'Pending':
        pending = count;
        break;
      case 'Preparing':
      case 'Ready':
      case 'OnHold':
        inProgress += count;
        break;
      default:
        // Các trạng thái khác (nếu có) → có thể gộp vào "Đang diễn ra" hoặc bỏ qua
        // Ở đây, để an toàn, ta gộp vào "Đang diễn ra"
        inProgress += count;
    }
  });

  // Tổng = completed + inProgress + pending (không tính Draft)
  const total = completed + inProgress + pending;

  const revenueChart = (revenueData?.data?.monthlyStats || []).map((item) => ({
    month: `T${new Date(item.month).getMonth() + 1}`,
    revenue: item.revenue,
  }));

  const firstUpcoming = upcomingData?.data?.[0];
  const reminder = firstUpcoming
    ? {
        name: firstUpcoming.conferenceName,
        date: firstUpcoming.startDate,
      }
    : null;

  const topConferences = (topData?.data?.conferenceRegisters || []).map((item) => ({
    id: item.conferenceId,
    name: item.name,
    registrations: item.purchaseSlot,
    totalSlot: item.totalSlot,
    occupancyRate: item.occupancyRate,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Quản Lý Hội Nghị/ Hội Thảo</h1>

        <ConferenceStats
          total={total}
          completed={completed}
          inProgress={inProgress}
          pending={pending}
        />

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <RevenueChart data={revenueChart} />
          </div>
          {reminder ? (
            <UpcomingReminder conference={reminder} />
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-center">
              Không có hội nghị hay hội thảo sắp tới
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <TopConferences conferences={topConferences} />
          <ConferenceProgress
            completed={completed}
            inProgress={inProgress}
            pending={pending}
          />
          {/* Cột thứ 3 để trống hoặc mở rộng sau */}
        </div>
      </div>
    </div>
  );
}