"use client";
import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface SimpleCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  minDate?: string; // "YYYY-MM-DD"
  maxDate?: string; // "YYYY-MM-DD"
  title?: string;
  className?: string;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  onDateSelect,
  selectedDate,
  minDate,
  maxDate,
  title = "Chọn ngày",
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper
  const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isWithinRange = (date: Date): boolean => {
    if (!minDate && !maxDate) return true;
    const dateStr = date.toISOString().split("T")[0];
    if (minDate && dateStr < minDate) return false;
    if (maxDate && dateStr > maxDate) return false;
    return true;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = CN, 1 = T2, ...
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "prev" ? -1 : 1));
    setCurrentDate(newDate);
  };

  const today = new Date();

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            className="p-1.5 rounded hover:bg-gray-100"
            aria-label="Tháng sau"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }, (_, i) => {
            const dayNum = i - startingDayOfWeek + 1;
            const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              dayNum
            );

            const isToday = isCurrentMonth && isSameDay(date, today);
            const isSelected = selectedDate && isCurrentMonth && isSameDay(date, selectedDate);
            const isDisabled = !isCurrentMonth || !isWithinRange(date);

            return (
              <div
                key={i}
                onClick={() => {
                  if (!isDisabled && onDateSelect) {
                    onDateSelect(date);
                  }
                }}
                className={`
                  h-9 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors
                  ${isDisabled ? "text-gray-300 cursor-default" : "text-gray-700 hover:bg-gray-100"}
                  ${isToday && !isSelected ? "font-bold text-blue-600 border border-blue-200" : ""}
                  ${isSelected ? "bg-blue-600 text-white font-semibold" : ""}
                `}
              >
                {isCurrentMonth ? dayNum : ""}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendar;