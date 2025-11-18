import React from "react";
import { Clock, Users, Calendar } from "lucide-react";

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
    <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-500 hover:bg-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm mb-1">{session.sessionTitle}</h4>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {session.conferenceName}
          </p>
        </div>
        <div className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs font-medium">
          Đang sử dụng
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4 text-red-400" />
          <span className="font-mono">
            {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          • {calculateDuration(session.startTime, session.endTime)}
        </div>
      </div>
    </div>
  );
};