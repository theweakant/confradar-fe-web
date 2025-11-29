import React, { Fragment, useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Clock, X, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetAvailableTimesInRoomQuery } from "@/redux/services/room.service";
import type { Session, ResearchSession } from "@/types/conference.type";
import type { TimeSpan } from "@/types/room.type";
import {
  parseTimeToDate,
  formatTimeForDisplay,
  formatDuration,
  calculateDurationMinutes,
  canFitInTimeSpan,
  checkSessionConflict,
  normalizeTime,
  detectTimeFormat,
} from "@/components/molecules/Calendar/RoomCalendar/Modal/timeHelpers";

interface ChangeTimeModalProps {
  open: boolean;
  session: Session | ResearchSession | null;
  existingSessions: (Session | ResearchSession)[];
  onClose: () => void;
  onConfirm: (updatedSession: Session | ResearchSession) => void;
}

export const ChangeTimeModal: React.FC<ChangeTimeModalProps> = ({
  open,
  session,
  existingSessions,
  onClose,
  onConfirm,
}) => {
  const [selectedTimeSpan, setSelectedTimeSpan] = useState<TimeSpan | null>(null);
  const [customStartTime, setCustomStartTime] = useState<string>("");
  const [customDuration, setCustomDuration] = useState<number>(1);

  const {
    data: timesData,
    isLoading,
    error,
  } = useGetAvailableTimesInRoomQuery(
    {
      roomId: session?.roomId || "",
      date: session?.date || "",
    },
    {
      skip: !session || !session.roomId || !session.date || !open,
    }
  );

  const timeSpans = timesData?.data || [];

  const timeFormat = useMemo(() => {
    if (!session) return 'iso';
    return detectTimeFormat(session.startTime);
  }, [session]);

  useEffect(() => {
    if (open && session) {
      setSelectedTimeSpan(null);
      setCustomStartTime("");
      setCustomDuration(
        calculateDurationMinutes(session.startTime, session.endTime, session.date) / 60 || 1
      );
    }
  }, [open, session]);

  const calculatedEndTime = useMemo(() => {
    if (!customStartTime || !session) return "";

    const startDate = parseTimeToDate(customStartTime, session.date);
    if (!startDate) return "";

    const endDate = new Date(startDate.getTime() + customDuration * 60 * 60 * 1000);
    return endDate.toISOString();
  }, [customStartTime, customDuration, session]);

  const hasConflict = useMemo(() => {
    if (!session || !customStartTime || !calculatedEndTime) return false;

    const testSession = {
      ...session,
      startTime: customStartTime,
      endTime: calculatedEndTime,
    };

    return checkSessionConflict(testSession, existingSessions, session.sessionId);
  }, [session, customStartTime, calculatedEndTime, existingSessions]);

  const compatibleTimeSpans = useMemo(() => {
    if (!session) return [];

    const currentDuration = calculateDurationMinutes(
      session.startTime,
      session.endTime,
      session.date
    );

    return timeSpans.filter((span) => {
      const spanDuration = calculateDurationMinutes(
        span.startTime,
        span.endTime,
        session.date
      );
      return spanDuration >= currentDuration;
    });
  }, [timeSpans, session]);

  const handleSelectTimeSpan = (span: TimeSpan) => {
    if (!session) return;

    setSelectedTimeSpan(span);

    const startISO = `${session.date}T${span.startTime}`;
    setCustomStartTime(startISO);

    const maxDuration = calculateDurationMinutes(span.startTime, span.endTime, session.date) / 60;
    const currentDuration = calculateDurationMinutes(
      session.startTime,
      session.endTime,
      session.date
    ) / 60;

    setCustomDuration(Math.min(currentDuration, maxDuration));
  };

  const isValidCustomTime = useMemo(() => {
    if (!session || !customStartTime || !calculatedEndTime || !selectedTimeSpan) {
      return false;
    }

    const fitsInSpan = canFitInTimeSpan(
      customStartTime,
      calculatedEndTime,
      `${session.date}T${selectedTimeSpan.startTime}`,
      `${session.date}T${selectedTimeSpan.endTime}`,
      session.date
    );

    return fitsInSpan && !hasConflict;
  }, [session, customStartTime, calculatedEndTime, selectedTimeSpan, hasConflict]);

  const handleConfirm = () => {
    if (!session || !customStartTime || !calculatedEndTime) {
      toast.error("Vui lòng chọn khung giờ mới!");
      return;
    }

    if (hasConflict) {
      toast.error("Khung giờ này bị trùng với session khác!");
      return;
    }

    if (!isValidCustomTime) {
      toast.error("Khung giờ không hợp lệ!");
      return;
    }

    const updatedSession = {
      ...session,
      startTime: timeFormat === 'timeonly' 
        ? normalizeTime(customStartTime, session.date, 'timeonly')
        : customStartTime,
      endTime: timeFormat === 'timeonly'
        ? normalizeTime(calculatedEndTime, session.date, 'timeonly')
        : calculatedEndTime,
      timeRange: customDuration,
    };

    onConfirm(updatedSession);
    toast.success("Đã đổi giờ thành công!");
  };

  if (!session) return null;

  const maxDuration = selectedTimeSpan
    ? calculateDurationMinutes(
        `${session.date}T${selectedTimeSpan.startTime}`,
        `${session.date}T${selectedTimeSpan.endTime}`,
        session.date
      ) / 60
    : 24;

  return (
    <Transition appear show={open} as={Fragment}>
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
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-white" />
                      <div>
                        <DialogTitle className="text-lg font-semibold text-white">
                          Đổi giờ phiên họp
                        </DialogTitle>
                        <div className="text-xs text-blue-100 mt-0.5">
                          {session.roomDisplayName || `Phòng ${session.roomNumber}`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1.5 hover:bg-blue-500/50 rounded-md transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{session.title}</h4>
                      <div className="text-sm text-gray-600">
                        <div>
                          Giờ hiện tại: {formatTimeForDisplay(session.startTime, session.date)} -{" "}
                          {formatTimeForDisplay(session.endTime, session.date)}
                        </div>
                        <div>
                          Thời lượng: {formatDuration(session.startTime, session.endTime, session.date)}
                        </div>
                      </div>
                    </div>

                    {isLoading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm text-red-700">Không thể tải khung giờ trống</p>
                      </div>
                    )}

                    {!isLoading && !error && (
                      <>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Chọn khung giờ trống ({compatibleTimeSpans.length})
                          </label>
                          {compatibleTimeSpans.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                              <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                              <p className="text-sm text-yellow-700">
                                Không có khung giờ trống phù hợp với thời lượng hiện tại
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {compatibleTimeSpans.map((span, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSelectTimeSpan(span)}
                                  className={`text-left bg-white rounded-lg p-3 border-2 transition-all ${
                                    selectedTimeSpan === span
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-blue-300"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-blue-600" />
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {formatTimeForDisplay(span.startTime, session.date)} -{" "}
                                          {formatTimeForDisplay(span.endTime, session.date)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {formatDuration(span.startTime, span.endTime, session.date)}
                                        </div>
                                      </div>
                                    </div>
                                    {selectedTimeSpan === span && (
                                      <CheckCircle className="w-5 h-5 text-blue-600" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {selectedTimeSpan && (
                          <div className="border-t pt-4">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Điều chỉnh thời lượng
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                max={maxDuration}
                                value={customDuration}
                                onChange={(e) => setCustomDuration(Number(e.target.value))}
                                className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-sm text-gray-600">giờ</span>
                              <span className="text-xs text-gray-500">
                                (Tối đa: {maxDuration.toFixed(1)}h)
                              </span>
                            </div>
                          </div>
                        )}

                        {customStartTime && calculatedEndTime && (
                          <div
                            className={`rounded-lg p-4 ${
                              hasConflict
                                ? "bg-red-50 border border-red-200"
                                : isValidCustomTime
                                ? "bg-green-50 border border-green-200"
                                : "bg-yellow-50 border border-yellow-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {hasConflict ? (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              ) : isValidCustomTime ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div
                                  className={`text-sm font-medium mb-1 ${
                                    hasConflict
                                      ? "text-red-900"
                                      : isValidCustomTime
                                      ? "text-green-900"
                                      : "text-yellow-900"
                                  }`}
                                >
                                  {hasConflict
                                    ? "Trùng với session khác"
                                    : isValidCustomTime
                                    ? "Khung giờ hợp lệ"
                                    : "Vượt quá khung giờ trống"}
                                </div>
                                <div
                                  className={`text-sm ${
                                    hasConflict
                                      ? "text-red-700"
                                      : isValidCustomTime
                                      ? "text-green-700"
                                      : "text-yellow-700"
                                  }`}
                                >
                                  Giờ mới: {formatTimeForDisplay(customStartTime, session.date)} -{" "}
                                  {formatTimeForDisplay(calculatedEndTime, session.date)} (
                                  {formatDuration(customStartTime, calculatedEndTime, session.date)})
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!isValidCustomTime || hasConflict}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xác nhận
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};