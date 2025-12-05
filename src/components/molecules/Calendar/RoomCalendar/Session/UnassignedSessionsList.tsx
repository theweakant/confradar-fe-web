import React from "react";
import { AlertCircle} from "lucide-react";
import type { Session, ResearchSession } from "@/types/conference.type";

interface UnassignedSessionsListProps {
  sessions: (Session | ResearchSession)[];
  onAssignRoom: (session: Session | ResearchSession, index: number) => void;
}

export const UnassignedSessionsList: React.FC<UnassignedSessionsListProps> = ({
  sessions,
  onAssignRoom,
}) => {
  const formatTime = (timeStr: string) => {
    if (timeStr.includes('T')) {
      const date = new Date(timeStr);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return timeStr.slice(0, 5);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    try {
      if (start.includes('T') && end.includes('T')) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error('Invalid date:', { start, end });
          return 'N/A';
        }
        
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 0) {
          console.warn('⚠️ Negative duration:', { start, end, diffMinutes });
          return '0h';
        }
        
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
      }
      
      const startTime = start.includes('T') ? start.split('T')[1] : start;
      const endTime = end.includes('T') ? end.split('T')[1] : end;
      
      const startParts = startTime.split(':');
      const endParts = endTime.split(':');
      
      if (startParts.length < 2 || endParts.length < 2) {
        console.error('Invalid time format:', { start, end });
        return 'N/A';
      }
      
      const startHour = parseInt(startParts[0], 10);
      const startMin = parseInt(startParts[1], 10);
      const endHour = parseInt(endParts[0], 10);
      const endMin = parseInt(endParts[1], 10);
      
      const startTotalMinutes = startHour * 60 + startMin;
      const endTotalMinutes = endHour * 60 + endMin;
      const diffMinutes = endTotalMinutes - startTotalMinutes;
      
      // Xử lý qua đêm
      if (diffMinutes < 0) {
        const adjustedDiff = (24 * 60) + diffMinutes;
        const hours = Math.floor(adjustedDiff / 60);
        const minutes = adjustedDiff % 60;
        return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
      }
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
      
    } catch (error) {
      console.error('Error calculating duration:', error, { start, end });
      return 'N/A';
    }
  };

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">
              Session chưa có phòng ({sessions.length})
            </h3>
            <p className="text-sm text-yellow-800">
              Các session này cần được gán phòng. Click vào nút &quot;Gán phòng&quot; để chọn phòng phù hợp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session, index) => (
            <div
              key={session.sessionId || index}
              className="bg-white rounded-lg border border-gray-300 p-4 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                  {session.title}
                </h4>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Ngày:</span>{" "}
                    {formatDate(session.date)}
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Giờ:</span>{" "}
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({calculateDuration(session.startTime, session.endTime)})
                    </span>
                  </div>

                  {session.description && (
                    <p className="text-gray-600 line-clamp-2 pt-1">
                      {session.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onAssignRoom(session, index)}
                className="mt-4 w-full px-4 py-2 bg-black hover:bg-black text-white rounded-md transition-colors text-sm font-medium"
              >
                Gán phòng
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};