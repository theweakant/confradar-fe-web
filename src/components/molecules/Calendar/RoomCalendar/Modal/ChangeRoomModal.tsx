// components/Session/ChangeRoomModal.tsx
import React, { Fragment, useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { MapPin, X, AlertCircle, CheckCircle, Clock, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAvailableRoomsBetweenDatesQuery,
  useGetAvailableTimesInRoomQuery,
} from "@/redux/services/room.service";
import { ChangeTimeModal } from "./ChangeTimeModal";
import type { Session, ResearchSession } from "@/types/conference.type";
import type { AvailableRoom } from "@/types/room.type";
import {
  formatTimeForDisplay,
  formatDuration,
  formatDateForDisplay,
  canFitInTimeSpan,
  checkSessionConflict,
  detectTimeFormat,
  createISOFromDateTime,
} from "@/components/molecules/Calendar/RoomCalendar/Modal/timeHelpers";

interface ChangeRoomModalProps {
  open: boolean;
  session: Session | ResearchSession | null;
  existingSessions: (Session | ResearchSession)[];
  onClose: () => void;
  onConfirm: (updatedSession: Session | ResearchSession) => void;
}

export const ChangeRoomModal: React.FC<ChangeRoomModalProps> = ({
  open,
  session,
  existingSessions,
  onClose,
  onConfirm,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedRoomData, setSelectedRoomData] = useState<AvailableRoom | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempSession, setTempSession] = useState<Session | ResearchSession | null>(null);

  // Fetch available rooms on the same date
  const {
    data: roomsData,
    isLoading: loadingRooms,
  } = useGetAvailableRoomsBetweenDatesQuery(
    {
      startdate: session?.date || "",
      endate: session?.date || "",
    },
    {
      skip: !session || !session.date || !open,
    }
  );

  // Fetch available times for selected room
  const {
    data: timesData,
    isLoading: loadingTimes,
    isFetching: fetchingTimes,
  } = useGetAvailableTimesInRoomQuery(
    {
      roomId: selectedRoomId,
      date: session?.date || "",
    },
    {
      skip: !selectedRoomId || !session?.date || !open,
    }
  );

  const availableRooms = useMemo(() => {
    if (!roomsData?.data || !session) return [];
    
    // Filter rooms on the same date, exclude current room
    return roomsData.data.filter(
      (room) => room.date === session.date && room.roomId !== session.roomId
    );
  }, [roomsData, session]);

  const timeSpans = timesData?.data || [];

  // Detect session time format
  const timeFormat = useMemo(() => {
    if (!session) return 'iso';
    return detectTimeFormat(session.startTime);
  }, [session]);

  // Reset state khi mở modal
  useEffect(() => {
    if (open && session) {
      setSelectedRoomId("");
      setSelectedRoomData(null);
      setShowTimeModal(false);
      setTempSession(null);
    }
  }, [open, session]);

  // Update selected room data khi chọn phòng
  useEffect(() => {
    if (selectedRoomId && availableRooms.length > 0) {
      const roomData = availableRooms.find((r) => r.roomId === selectedRoomId);
      setSelectedRoomData(roomData || null);
    } else {
      setSelectedRoomData(null);
    }
  }, [selectedRoomId, availableRooms]);

  // Kiểm tra có thể giữ nguyên giờ không
  const canKeepSameTime = useMemo(() => {
    if (!session || !selectedRoomId || timeSpans.length === 0) {
      return { canKeep: false, reason: "" };
    }

    // Check có time span nào fit không
    const hasFittingSpan = timeSpans.some((span) => {
      const spanStart = `${session.date}T${span.startTime}`;
      const spanEnd = `${session.date}T${span.endTime}`;
      
      const sessionStart = timeFormat === 'iso'
        ? session.startTime
        : createISOFromDateTime(session.date, session.startTime);
      
      const sessionEnd = timeFormat === 'iso'
        ? session.endTime
        : createISOFromDateTime(session.date, session.endTime);

      return canFitInTimeSpan(sessionStart, sessionEnd, spanStart, spanEnd, session.date);
    });

    if (!hasFittingSpan) {
      return {
        canKeep: false,
        reason: "Phòng không có khung giờ trống phù hợp với giờ hiện tại",
      };
    }

    // Check conflict với sessions khác trong phòng mới
    const testSession = {
      ...session,
      roomId: selectedRoomId,
      roomDisplayName: selectedRoomData?.roomDisplayName,
      roomNumber: selectedRoomData?.roomNumber,
    };

    const hasConflict = checkSessionConflict(testSession, existingSessions, session.sessionId);

    if (hasConflict) {
      return {
        canKeep: false,
        reason: "Giờ này đã có session khác trong phòng",
      };
    }

    return { canKeep: true, reason: "" };
  }, [session, selectedRoomId, timeSpans, existingSessions, selectedRoomData, timeFormat]);

  // Categorize rooms
  const categorizedRooms = useMemo(() => {
    if (!session) return { compatible: [], incompatible: [] };

    const compatible: AvailableRoom[] = [];
    const incompatible: AvailableRoom[] = [];

    availableRooms.forEach((room) => {
      // Check if room has any time span that fits the session
      const hasCompatibleSpan = room.availableTimeSpans.some((span) => {
        const spanStart = `${room.date}T${span.startTime}`;
        const spanEnd = `${room.date}T${span.endTime}`;
        
        const sessionStart = timeFormat === 'iso'
          ? session.startTime
          : createISOFromDateTime(session.date, session.startTime);
        
        const sessionEnd = timeFormat === 'iso'
          ? session.endTime
          : createISOFromDateTime(session.date, session.endTime);

        return canFitInTimeSpan(sessionStart, sessionEnd, spanStart, spanEnd, room.date);
      });

      if (hasCompatibleSpan) {
        compatible.push(room);
      } else {
        incompatible.push(room);
      }
    });

    return { compatible, incompatible };
  }, [availableRooms, session, timeFormat]);

  // Xử lý xác nhận giữ nguyên giờ
  const handleKeepSameTime = () => {
    if (!session || !selectedRoomId || !selectedRoomData || !canKeepSameTime.canKeep) return;

    const updatedSession = {
      ...session,
      roomId: selectedRoomId,
      roomDisplayName: selectedRoomData.roomDisplayName,
      roomNumber: selectedRoomData.roomNumber,
    };

    onConfirm(updatedSession);
    toast.success(`Đã chuyển sang ${selectedRoomData.roomDisplayName || `phòng ${selectedRoomData.roomNumber}`}!`);
    onClose();
  };

  // Xử lý chọn giờ mới
  const handleChangeTime = () => {
    if (!session || !selectedRoomId || !selectedRoomData) return;

    // Tạo temp session với phòng mới
    const temp = {
      ...session,
      roomId: selectedRoomId,
      roomDisplayName: selectedRoomData.roomDisplayName,
      roomNumber: selectedRoomData.roomNumber,
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

  const getRoomColor = (isAvailableWholeday: boolean) =>
    isAvailableWholeday ? "green" : "blue";

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
                <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-white" />
                        <div>
                          <DialogTitle className="text-lg font-semibold text-white">
                            Đổi phòng phiên họp
                          </DialogTitle>
                          <div className="text-xs text-orange-100 mt-0.5">
                            {formatDateForDisplay(session.date)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-orange-500/50 rounded-md transition-colors"
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
                            <span className="font-medium">Phòng hiện tại:</span>
                            <div className="text-gray-900 mt-1">
                              {session.roomDisplayName || `Phòng ${session.roomNumber}`}
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

                      {/* Room selector */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Chọn phòng mới <span className="text-red-500">*</span>
                        </label>

                        {loadingRooms ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                            <span className="ml-3 text-sm text-gray-600">
                              Đang tải danh sách phòng...
                            </span>
                          </div>
                        ) : availableRooms.length === 0 ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-700">
                              Không có phòng khác trống vào ngày này
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Compatible rooms */}
                            {categorizedRooms.compatible.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Phù hợp với giờ hiện tại ({categorizedRooms.compatible.length})
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {categorizedRooms.compatible.map((room) => {
                                    const color = getRoomColor(room.isAvailableWholeday);
                                    const isSelected = selectedRoomId === room.roomId;

                                    return (
                                      <button
                                        key={room.roomId}
                                        onClick={() => setSelectedRoomId(room.roomId)}
                                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                                          isSelected
                                            ? `border-${color}-500 bg-${color}-50`
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-2">
                                            <DoorOpen className={`w-4 h-4 text-${color}-600 flex-shrink-0`} />
                                            <div>
                                              <div className="font-medium text-gray-900 text-sm">
                                                {room.roomDisplayName || `Phòng ${room.roomNumber}`}
                                              </div>
                                              <div className="text-xs text-gray-500 mt-0.5">
                                                {room.isAvailableWholeday
                                                  ? "Trống cả ngày"
                                                  : `${room.availableTimeSpans.length} khung giờ`}
                                              </div>
                                            </div>
                                          </div>
                                          {isSelected && (
                                            <CheckCircle className={`w-5 h-5 text-${color}-600`} />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Incompatible rooms */}
                            {categorizedRooms.incompatible.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-orange-700 mb-2 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Cần đổi giờ ({categorizedRooms.incompatible.length})
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {categorizedRooms.incompatible.map((room) => {
                                    const color = getRoomColor(room.isAvailableWholeday);
                                    const isSelected = selectedRoomId === room.roomId;

                                    return (
                                      <button
                                        key={room.roomId}
                                        onClick={() => setSelectedRoomId(room.roomId)}
                                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                                          isSelected
                                            ? `border-${color}-500 bg-${color}-50`
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-2">
                                            <DoorOpen className={`w-4 h-4 text-${color}-600 flex-shrink-0`} />
                                            <div>
                                              <div className="font-medium text-gray-900 text-sm">
                                                {room.roomDisplayName || `Phòng ${room.roomNumber}`}
                                              </div>
                                              <div className="text-xs text-orange-600 mt-0.5">
                                                Cần chọn giờ khác
                                              </div>
                                            </div>
                                          </div>
                                          {isSelected && (
                                            <CheckCircle className={`w-5 h-5 text-${color}-600`} />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Availability check */}
                      {selectedRoomId && (
                        <div className="border-t pt-4">
                          {loadingTimes || fetchingTimes ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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
                                    Vui lòng chọn phòng khác
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
                                      Có {timeSpans.length} khung giờ trống trong phòng này
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