// components/Session/ChangeDateModal.tsx
import React, { Fragment, useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CalendarDays, X, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useGetAvailableTimesInRoomQuery } from "@/redux/services/room.service";
import { ChangeTimeModal } from "./ChangeTimeModal";
import type { Session, ResearchSession } from "@/types/conference.type";
import {
  formatTimeForDisplay,
  formatDuration,
  formatDateForDisplay,
  canFitInTimeSpan,
  checkSessionConflict,
  detectTimeFormat,
  createISOFromDateTime,
} from "@/components/molecules/Calendar/RoomCalendar/Modal/timeHelpers";

interface ChangeDateModalProps {
  open: boolean;
  session: Session | ResearchSession | null;
  existingSessions: (Session | ResearchSession)[];
  conferenceStartDate?: string;
  conferenceEndDate?: string;
  onClose: () => void;
  onConfirm: (updatedSession: Session | ResearchSession) => void;
}

export const ChangeDateModal: React.FC<ChangeDateModalProps> = ({
  open,
  session,
  existingSessions,
  conferenceStartDate,
  conferenceEndDate,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempSession, setTempSession] = useState<Session | ResearchSession | null>(null);

  // Fetch available times for selected date
  const {
    data: timesData,
    isLoading,
    isFetching,
  } = useGetAvailableTimesInRoomQuery(
    {
      roomId: session?.roomId || "",
      date: selectedDate,
    },
    {
      skip: !session || !session.roomId || !selectedDate || !open,
    }
  );

  const timeSpans = timesData?.data || [];

  // Detect session time format
  const timeFormat = useMemo(() => {
    if (!session) return 'iso';
    return detectTimeFormat(session.startTime);
  }, [session]);

  // Reset state khi mở modal
  useEffect(() => {
    if (open && session) {
      setSelectedDate("");
      setShowTimeModal(false);
      setTempSession(null);
    }
  }, [open, session]);

  // Kiểm tra có thể giữ nguyên giờ không
  const canKeepSameTime = useMemo(() => {
    if (!session || !selectedDate || timeSpans.length === 0) {
      return { canKeep: false, reason: "" };
    }

    // Tạo giờ bắt đầu/kết thúc với ngày mới
    const newStartTime = timeFormat === 'iso'
      ? createISOFromDateTime(selectedDate, session.startTime)
      : session.startTime;

    const newEndTime = timeFormat === 'iso'
      ? createISOFromDateTime(selectedDate, session.endTime)
      : session.endTime;

    // Check có time span nào fit không
    const hasFittingSpan = timeSpans.some((span) => {
      const spanStart = `${selectedDate}T${span.startTime}`;
      const spanEnd = `${selectedDate}T${span.endTime}`;
      return canFitInTimeSpan(newStartTime, newEndTime, spanStart, spanEnd, selectedDate);
    });

    if (!hasFittingSpan) {
      return { 
        canKeep: false, 
        reason: "Không có khung giờ trống phù hợp với giờ hiện tại" 
      };
    }

    // Check conflict với sessions khác
    const testSession = {
      ...session,
      date: selectedDate,
      startTime: newStartTime,
      endTime: newEndTime,
    };

    const hasConflict = checkSessionConflict(testSession, existingSessions, session.sessionId);

    if (hasConflict) {
      return { 
        canKeep: false, 
        reason: "Giờ này đã có session khác trong phòng" 
      };
    }

    return { canKeep: true, reason: "" };
  }, [session, selectedDate, timeSpans, existingSessions, timeFormat]);

  // Generate date options trong khoảng conference
  const dateOptions = useMemo(() => {
    if (!conferenceStartDate || !conferenceEndDate) return [];

    const options: { value: string; label: string }[] = [];
    const start = new Date(conferenceStartDate);
    const end = new Date(conferenceEndDate);
    
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Không cho chọn ngày hiện tại
      if (dateStr !== session?.date) {
        options.push({
          value: dateStr,
          label: formatDateForDisplay(dateStr),
        });
      }
      
      current.setDate(current.getDate() + 1);
    }

    return options;
  }, [conferenceStartDate, conferenceEndDate, session?.date]);

  // Xử lý xác nhận giữ nguyên giờ
  const handleKeepSameTime = () => {
    if (!session || !selectedDate || !canKeepSameTime.canKeep) return;

    const updatedSession = {
      ...session,
      date: selectedDate,
      startTime: timeFormat === 'iso'
        ? createISOFromDateTime(selectedDate, session.startTime)
        : session.startTime,
      endTime: timeFormat === 'iso'
        ? createISOFromDateTime(selectedDate, session.endTime)
        : session.endTime,
    };

    onConfirm(updatedSession);
    toast.success(`Đã chuyển sang ${formatDateForDisplay(selectedDate)}!`);
    onClose();
  };

  // Xử lý chọn giờ mới
  const handleChangeTime = () => {
    if (!session || !selectedDate) return;

    // Tạo temp session với ngày mới để truyền vào ChangeTimeModal
    const temp = {
      ...session,
      date: selectedDate,
    };

    setTempSession(temp);
    setShowTimeModal(true);
  };

  // Xử lý confirm từ ChangeTimeModal
  const handleTimeModalConfirm = (updatedSession: Session | ResearchSession) => {
    onConfirm(updatedSession);
    setShowTimeModal(false);
    onClose();
  };

  if (!session) return null;

  return (
    <>
      <Transition appear show={open && !showTimeModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-white" />
                        <div>
                          <DialogTitle className="text-lg font-semibold text-white">
                            Đổi ngày phiên họp
                          </DialogTitle>
                          <div className="text-xs text-purple-100 mt-0.5">
                            {session.roomDisplayName || `Phòng ${session.roomNumber}`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-purple-500/50 rounded-md transition-colors"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                      {/* Current session info */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{session.title}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Ngày hiện tại:</span>
                            <div className="text-gray-900 mt-1">
                              {formatDateForDisplay(session.date)}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Giờ:</span>
                            <div className="text-gray-900 mt-1">
                              {formatTimeForDisplay(session.startTime, session.date)} -{" "}
                              {formatTimeForDisplay(session.endTime, session.date)}
                              <span className="text-gray-500 ml-2">
                                ({formatDuration(session.startTime, session.endTime, session.date)})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date selector */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Chọn ngày mới <span className="text-red-500">*</span>
                        </label>
                        {dateOptions.length === 0 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-700">
                              Không có ngày khác trong khoảng thời gian
                            </p>
                          </div>
                        ) : (
                          <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="">-- Chọn ngày --</option>
                            {dateOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Availability check */}
                      {selectedDate && (
                        <div className="border-t pt-4">
                          {isLoading || isFetching ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                              <span className="ml-3 text-sm text-gray-600">
                                Đang kiểm tra khung giờ trống...
                              </span>
                            </div>
                          ) : timeSpans.length === 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-red-900 mb-1">
                                    Phòng không có khung giờ trống
                                  </div>
                                  <div className="text-sm text-red-700">
                                    Phòng {session.roomDisplayName || session.roomNumber} không có khung giờ
                                    trống nào vào ngày {formatDateForDisplay(selectedDate)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Keep same time option */}
                              {canKeepSameTime.canKeep ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-green-900 mb-1">
                                        ✅ Có thể giữ nguyên giờ
                                      </div>
                                      <div className="text-sm text-green-700 mb-3">
                                        Phòng trống vào khung giờ{" "}
                                        {formatTimeForDisplay(session.startTime, session.date)} -{" "}
                                        {formatTimeForDisplay(session.endTime, session.date)}
                                      </div>
                                      <button
                                        onClick={handleKeepSameTime}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                                      >
                                        Giữ nguyên giờ và xác nhận
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-sm font-medium text-yellow-900 mb-1">
                                        ⚠️ Không thể giữ nguyên giờ
                                      </div>
                                      <div className="text-sm text-yellow-700">
                                        {canKeepSameTime.reason}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Change time option */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-blue-900 mb-1">
                                      Chọn khung giờ mới
                                    </div>
                                    <div className="text-sm text-blue-700 mb-3">
                                      Có {timeSpans.length} khung giờ trống trong ngày này
                                    </div>
                                    <button
                                      onClick={handleChangeTime}
                                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                      Chọn giờ mới
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Time selection modal */}
      {tempSession && (
        <ChangeTimeModal
          open={showTimeModal}
          session={tempSession}
          existingSessions={existingSessions}
          onClose={() => {
            setShowTimeModal(false);
            setTempSession(null);
          }}
          onConfirm={handleTimeModalConfirm}
        />
      )}
    </>
  );
};