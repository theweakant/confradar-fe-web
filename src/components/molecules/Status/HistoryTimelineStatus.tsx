// HistoryTimelineStatus.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ConferenceTimelineItem {
  conferenceTimelineId: string;
  changeDate: string; // e.g. "2025-11-16"
  previousStatusName: string;
  afterwardStatusName: string;
  reason: string | null;
  conferenceName: string;
}

interface HistoryTimelineStatusProps {
  open: boolean;
  onClose: () => void;
  timelines: ConferenceTimelineItem[];
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const HistoryTimelineStatus: React.FC<HistoryTimelineStatusProps> = ({
  open,
  onClose,
  timelines,
}) => {
  if (!open) return null;

  // Sắp xếp mới nhất trước
  const sortedTimelines = [...timelines].sort(
    (a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Lịch sử thay đổi trạng thái</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedTimelines.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Không có lịch sử thay đổi.</p>
          ) : (
            <div className="relative pl-6 border-l-2 border-gray-200">
              {sortedTimelines.map((item) => (
                <div key={item.conferenceTimelineId} className="mb-6 relative">
                  {/* Dot timeline */}
                  <div className="absolute -left-3 top-1 w-2 h-2 rounded-full bg-blue-500"></div>

                  {/* Nội dung */}
                  <div className="mb-1 text-sm text-gray-500">{formatDate(item.changeDate)}</div>
                  <div className="bg-gray-50 p-3 rounded-md shadow-sm">
                    <div className="font-medium text-gray-900">
                      <span className="text-gray-700">{item.previousStatusName}</span> →{' '}
                      <span className="text-green-600">{item.afterwardStatusName}</span>
                    </div>
                    {item.reason && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Lý do:</span> {item.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay close */}
      <div className="absolute inset-0" onClick={onClose}></div>
    </div>
  );
};

