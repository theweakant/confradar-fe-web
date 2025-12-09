// components/OtherRequestTab/Session/SessionChangeCard.tsx

import { Clock, Layers } from "lucide-react";
import { formatDate } from "@/helper/format";
import { renderStatusBadge } from "../utils/utils";
import type { PendingSessionChangeResponse } from "@/types/assigningpresentersession.type";

interface SessionChangeCardProps {
  request: PendingSessionChangeResponse;
  onClick: () => void;
}

export function SessionChangeCard({ request, onClick }: SessionChangeCardProps) {
  const currentTitle = request.currentSession?.title || "Không có tiêu đề";
  const newTitle = request.newSession?.title || "Không có tiêu đề";

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Bài báo</p>
          <p className="text-base font-bold text-gray-900">{request.paparTile  }</p>
        </div>
        {renderStatusBadge(request.globalStatusName)}
      </div>

      {/* Session Change */}
      <div className="flex items-center gap-3 py-3 px-3 bg-gray-50 rounded-lg mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Layers className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Session hiện tại</p>
            <p className="text-sm font-medium text-gray-900 truncate">{currentTitle}</p>
          </div>
        </div>
        
        <div className="text-gray-400 font-bold">→</div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-600">Session mới</p>
            <p className="text-sm font-semibold text-blue-700 truncate">{newTitle}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{request.requestAt ? formatDate(request.requestAt) : "N/A"}</span>
        </div>
        <span className="text-gray-400">Nhấn để xem chi tiết</span>
      </div>
    </div>
  );
}