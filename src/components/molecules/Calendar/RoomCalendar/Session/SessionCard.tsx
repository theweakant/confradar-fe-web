import React from "react";
import { Clock, Users } from "lucide-react";

interface SessionCardProps {
  session: {
    sessionId: string;
    sessionTitle: string;
    startTime: string;
    endTime: string;
    conferenceId: string;
    conferenceName: string;
  };
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
  };

  return (
    <div className="bg-white rounded-lg p-3 border-l-4 border-orange-500 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
            {session.sessionTitle}
          </h4>
          <p className="text-xs text-gray-600 flex items-center gap-1 truncate">
            <Users className="w-3 h-3 flex-shrink-0" />
            {session.conferenceName}
          </p>
        </div>
        <div className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium ml-2 flex-shrink-0">
          Đang dùng
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-700">
          <Clock className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <span className="font-medium">
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </span>
        </div>
        <div className="text-gray-500">
          • {calculateDuration(session.startTime, session.endTime)}
        </div>
      </div>
    </div>
  );
};