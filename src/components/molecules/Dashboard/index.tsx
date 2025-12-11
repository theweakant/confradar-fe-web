import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Users, Presentation, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useGetConferencesGroupByStatusQuery,
  useGetRevenueStatsQuery,
  useGetUpcomingConferencesQuery,
  useGetTopRegisteredConferencesQuery,
} from '@/redux/services/dashboard.service';
import { formatCurrency } from '@/helper/format';
import { useAuth } from '@/redux/hooks/useAuth';
import { MonthlyStat } from '@/types/dashboard.type';

// shadcn/ui components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

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
  conferenceId: string;
  conferenceName: string;
  bannerImageUrl?: string;
  startDate: string;
  endDate: string;
  daysUntilStart: number;
  statusName: string;
}

interface ReminderProps {
  conferences: UpcomingConference[];
  isLoading: boolean;
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
    <div className="bg-white rounded-3xl px-6 py-12 shadow-md border border-gray-100">
      <div className="flex items-end justify-between h-56 gap-2">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Chưa có dữ liệu doanh thu
          </div>
        ) : (
          data.map((item, index) => {
            const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={`revenue-bar-${index}`} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full h-full flex items-end relative">
                  {index % 2 === 0 && (
                    <div className="absolute inset-0 bg-gray-100/50 rounded-t-2xl" style={{ height: '100%' }}></div>
                  )}
                  <div
                    className="w-full rounded-2xl transition-all bg-emerald-500 relative z-10 hover:bg-emerald-600"
                    style={{ height: `${height}%`, minHeight: height > 0 ? '12px' : '0' }}
                    title={formatCurrency(item.revenue)}
                  ></div>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700 block">{item.month}</span>
                  <span className="text-xs text-gray-500">{formatCurrency(item.revenue)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const UpcomingReminder: React.FC<ReminderProps> = ({ conferences, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-gray-100">
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-gray-500">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  if (!conferences || conferences.length === 0) {
    return (
      <Card className="rounded-3xl border-gray-100">
        <CardContent className="p-6 flex items-center justify-center text-gray-500">
          Không có hội nghị sắp tới
        </CardContent>
      </Card>
    );
  }

  const conference = conferences[currentIndex];
  const hasMultiple = conferences.length > 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? conferences.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === conferences.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="rounded-3xl border-gray-100 relative">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex-1">{conference.conferenceName}</h4>
          <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full whitespace-nowrap">
            {conference.statusName === 'Ready' ? 'Sẵn sàng' : 'Sắp diễn ra'}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {new Date(conference.startDate).toLocaleDateString('vi-VN')} → {new Date(conference.endDate).toLocaleDateString('vi-VN')} 
          <span className="text-emerald-600 font-medium ml-2">
            ({conference.daysUntilStart} ngày nữa)
          </span>
        </p>

        {conference.bannerImageUrl && (
          <div className="rounded-2xl overflow-hidden">
            <img 
              src={conference.bannerImageUrl} 
              alt={conference.conferenceName}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {hasMultiple && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Hội nghị trước"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div className="flex gap-1.5">
              {conferences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'w-6 bg-emerald-500' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Đến hội nghị ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Hội nghị tiếp theo"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TopConferences: React.FC<TopConferencesProps> = ({ conferences }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Được tham dự nhiều nhất</h3>
      </div>
      <div className="space-y-4">
        {conferences.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Chưa có dữ liệu</div>
        ) : (
          conferences.map((conf) => (
            <div key={conf.id} className="flex items-center gap-2 p-2 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Presentation size={24} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate mb-1">{conf.name}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Users size={12} />
                  {conf.registrations} đăng ký ({conf.occupancyRate.toFixed(1)}%)
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const   ConferenceProgress: React.FC<ProgressProps> = ({ completed, inProgress, pending }) => {
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

// Helper: tạo danh sách tháng cho dropdown (tháng hiện tại trở về trước, tối đa 24 tháng)
const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const label = `${month} / ${year}`;
    const value = `${year}-${month.toString().padStart(2, '0')}`;
    options.push({ label, value, year, month });
  }
  return options;
};

// Helper: tạo dữ liệu doanh thu 6 tháng TRƯỚC (kể từ tháng được chọn)
const generateRevenueDataFor6MonthsBack = (
  selectedYear: number,
  selectedMonth: number,
  apiData: MonthlyStat[]
): RevenueData[] => {
  const result: RevenueData[] = [];
  const apiMap = new Map<string, number>();
  apiData.forEach((item) => {
    const key = `${item.year}-${item.month.toString().padStart(2, '0')}`;
    apiMap.set(key, item.monthlyTotal ?? 0);
  });

  for (let i = 5; i >= 0; i--) {
    const date = new Date(selectedYear, selectedMonth - 1 - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    const label = `T${month}`;
    result.push({
      month: label,
      revenue: apiMap.get(key) || 0,
    });
  }

  return result;
};

// ============= MAIN DASHBOARD =============
export default function ConferenceDashboard() {
  const { user } = useAuth();
  const userId = user?.userId || '';

  const [selectedRevenueMonth, setSelectedRevenueMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Chỉ cho chọn theo quý: 3, 6, 9, ..., 24 tháng
  const QUARTER_OPTIONS = [3, 6, 9, 12, 15, 18, 21, 24];
  const [upcomingMonths, setUpcomingMonths] = useState<number>(3);

  // Parse selected revenue month
  const { year: revYear, month: revMonth } = useMemo(() => {
    const [y, m] = selectedRevenueMonth.split('-').map(Number);
    return { year: y, month: m };
  }, [selectedRevenueMonth]);

  const { data: groupByStatusData } = useGetConferencesGroupByStatusQuery(userId, {
    skip: !userId,
  });

  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueStatsQuery(
    { userId, monthBack: 24 },
    { skip: !userId }
  );

  const { data: upcomingData, isLoading: upcomingLoading } = useGetUpcomingConferencesQuery(
    { userId, nextMonths: upcomingMonths },
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
let completed = 0;
let inProgress = 0; 
let pending = 0;

const groupByStatus = groupByStatusData?.data?.groupByStatus || [];
groupByStatus.forEach((group) => {
  const { count, groupName: status } = group;
  if (status === 'Completed') {
    completed = count;
  } else if (status === 'Ready') {
    inProgress = count;
  } else if (status === 'Pending') {
    pending = count;
  }
});
  const total = completed + inProgress + pending;

  // --- Revenue Chart Data ---
  const apiMonthlyStats = revenueData?.data?.monthlyStats || [];
  const revenueChart = generateRevenueDataFor6MonthsBack(revYear, revMonth, apiMonthlyStats);

  // --- Upcoming Conference ---
  const upcomingConferences = upcomingData?.data || [];

  // --- Top Conferences ---
  const topConferences = (topData?.data?.conferenceRegisters || []).map((item) => ({
    id: item.conferenceId,
    name: item.name,
    registrations: item.purchaseSlot,
    totalSlot: item.totalSlot,
    occupancyRate: item.occupancyRate,
  }));

  // Month options for revenue dropdown
  const monthOptions = generateMonthOptions();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Quản Lý</h1>

        <ConferenceStats
          total={total}
          completed={completed}
          inProgress={inProgress}
          pending={pending}
        />

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Doanh Thu Theo Tháng</h3>
              <Select
                value={selectedRevenueMonth}
                onValueChange={setSelectedRevenueMonth}
              >
                <SelectTrigger className="w-36 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <RevenueChart data={revenueChart} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Hội Nghị Sắp Tới</h3>
              <Select
                value={upcomingMonths.toString()}
                onValueChange={(v) => setUpcomingMonths(Number(v))}
              >
                <SelectTrigger className="w-28 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUARTER_OPTIONS.map((months) => (
                    <SelectItem key={months} value={months.toString()}>
                      {months} tháng
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <UpcomingReminder conferences={upcomingConferences} isLoading={upcomingLoading} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <TopConferences conferences={topConferences} />
          <ConferenceProgress
            completed={completed}
            inProgress={inProgress}
            pending={pending}
          />
        </div>
      </div>
    </div>
  );
}