// components/Session/LocalSessionCard.tsx
import React, { useState, useRef, useEffect } from "react";
import { Clock, Users, MoreVertical, CalendarDays, MapPin, Edit2, Trash2 } from "lucide-react";
import type { Session } from "@/types/conference.type";

interface LocalSessionCardProps {
  session: Session;
  isEditable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeDate?: () => void;
  onChangeRoom?: () => void;
  editableActions?: React.ReactNode;
}

export const LocalSessionCard: React.FC<LocalSessionCardProps> = ({
  session,
  isEditable = false,
  onEdit,
  onDelete,
  onChangeDate,
  onChangeRoom,
  editableActions,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("vi-VN", {
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

  const conferenceName = session.conferenceName || "Hội thảo của bạn";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleOptionClick = (action: () => void) => {
    setShowDropdown(false);
    action();
  };

  return (
    <div className="bg-white rounded-lg p-3 border-l-4 border-orange-500 hover:shadow-sm transition-all relative">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-gray-900 font-semibold text-sm mb-1 line-clamp-2">
            {session.title}
          </h4>
          <p className="text-xs text-gray-600 flex items-center gap-1 truncate">
            <Users className="w-3 h-3 flex-shrink-0" />
            {conferenceName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium whitespace-nowrap">
            {isEditable ? "Dự kiến" : "Đang dùng"}
          </div>
          
          {/* Dropdown menu - hiển thị ngay trên header */}
          {isEditable && (onEdit || onDelete || onChangeDate || onChangeRoom) && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Tùy chọn"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {onEdit && (
                    <button
                      onClick={() => handleOptionClick(onEdit)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                  {onChangeDate && (
                    <button
                      onClick={() => handleOptionClick(onChangeDate)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
                    >
                      <CalendarDays className="w-4 h-4 text-purple-600" />
                      <span>Đổi ngày</span>
                    </button>
                  )}
                  {onChangeRoom && (
                    <button
                      onClick={() => handleOptionClick(onChangeRoom)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span>Đổi phòng</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleOptionClick(onDelete)}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
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

      {session.speaker && session.speaker.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-medium text-gray-600">
              Diễn giả ({session.speaker.length})
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {session.speaker.map((speaker, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded"
              >
                {speaker.image ? (
                  <img
                    src={speaker.image instanceof File ? URL.createObjectURL(speaker.image) : speaker.image}
                    alt=""
                    className="w-3 h-3 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-gray-300 text-[8px] flex items-center justify-center text-white">
                    {speaker.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {speaker.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};