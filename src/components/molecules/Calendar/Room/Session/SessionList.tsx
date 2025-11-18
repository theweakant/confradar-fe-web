import React from "react";
import { Users, AlertCircle } from "lucide-react";
import { SessionCard } from "./SessionCard";

interface SessionListProps {
  sessions: Array<{
    sessionId: string;
    sessionTitle: string;
    startTime: string;
    endTime: string;
    conferenceId: string;
    conferenceName: string;
  }>;
  isLoading?: boolean;
}

export const SessionList: React.FC<SessionListProps> = ({ sessions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-500" />
        <p className="text-sm">Không có session nào đang sử dụng phòng</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-red-400" />
        <span className="text-sm font-semibold text-gray-300">
          Phòng đang được sử dụng ({sessions.length})
        </span>
      </div>
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>
    </div>
  );
};