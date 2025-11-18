import React, { Fragment, useState } from "react";
import { Clock, DoorOpen, Calendar, X, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { 
  useGetAvailableTimesInRoomQuery,
  useGetSessionsInRoomOnDateQuery 
} from "@/redux/services/room.service";
import { SessionList } from "./Session/SessionList";
import { SingleSessionForm } from "./Session/SingleSessionForm";
import type { Session } from "@/types/conference.type";

interface RoomDetailDialogProps {
  open: boolean;
  roomId: string | null;
  roomNumber?: string | null;
  roomDisplayName?: string | null;
  date: string | null;
  conferenceId?: string; 
  onClose: () => void;
  onSessionCreated?: (session: Session) => void; 
}

const RoomDetailDialog: React.FC<RoomDetailDialogProps> = ({
  open,
  roomId,
  roomNumber,
  roomDisplayName,
  date,
  conferenceId,
  onClose,
  onSessionCreated,
}) => {
  const [mode, setMode] = useState<"view" | "form">("view");
  
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
const [isCreatingSession, setIsCreatingSession] = useState(false);

  const { data: timesData, isLoading: loadingTimes } = useGetAvailableTimesInRoomQuery(
    { roomId: roomId!, date: date! },
    { skip: !roomId || !date || !open }
  );

  const { data: sessionsData, isLoading: loadingSessions } = useGetSessionsInRoomOnDateQuery(
    { roomId: roomId!, date: date! },
    { skip: !roomId || !date || !open }
  );

  const timeSpans = timesData?.data || [];
  const sessions = sessionsData?.data || [];
  
  const isWholeDay = timeSpans.length === 1 && 
    timeSpans[0].startTime === "00:00:00" && 
    timeSpans[0].endTime === "23:59:59";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const calculateDuration = (start: string, end: string) => {
    const startMinutes = parseInt(start.slice(0, 2)) * 60 + parseInt(start.slice(3, 5));
    const endMinutes = parseInt(end.slice(0, 2)) * 60 + parseInt(end.slice(3, 5));
    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ''}`;
  };

  // Handle time slot click → switch to form mode
  const handleTimeSlotSelect = (span: { startTime: string; endTime: string }) => {
    if (!conferenceId) {
      // Nếu không có conferenceId, không cho phép tạo session
      return;
    }

    // Convert HH:mm:ss to ISO format
    const dateStr = date!;
    const startISO = `${dateStr}T${span.startTime}`;
    const endISO = `${dateStr}T${span.endTime}`;

    setSelectedSlot({
      startTime: startISO,
      endTime: endISO,
    });
    setMode("form");
  };

  // Handle back from form to view
  const handleBackToView = () => {
    setMode("view");
    setSelectedSlot(null);
  };

  // Handle session save
const handleSessionSave = async (session: Session) => {
  if (onSessionCreated) {
    setIsCreatingSession(true);
    try {
      await onSessionCreated(session);
      setMode("view");
      setSelectedSlot(null);
    } catch (error) {
      console.error("Failed to create session:", error);
      // Keep form open on error
    } finally {
      setIsCreatingSession(false);
    }
  }
};

  // Reset state when dialog closes
  const handleClose = () => {
    setMode("view");
    setSelectedSlot(null);
    onClose();
  };

  const isLoading = loadingTimes || loadingSessions;

  return (
    <Transition appear show={open} as={Fragment} unmount={true}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white border border-gray-200 shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {mode === "form" ? (
                        <>
                          <button
                            onClick={handleBackToView}
                            disabled={isCreatingSession}  
                            className="p-1 hover:bg-blue-500/50 rounded transition-colors"
                          >
                            <ArrowLeft className="w-5 h-5 text-white" />
                          </button>
                          <DialogTitle className="text-xl font-bold text-white">
                            Tạo phiên họp
                          </DialogTitle>
                          {roomId && (
                            <div className="mt-1 text-sm text-blue-200 font-mono">
                              Phòng ID: {roomId}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <DoorOpen className="w-6 h-6 text-white" />
                          <DialogTitle className="text-xl font-bold text-white">
                            {isCreatingSession ? "Đang tạo session..." : "Tạo phiên họp"}
                          </DialogTitle>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isCreatingSession} 
                      className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : mode === "form" && selectedSlot && conferenceId ? (
                    <div className={isCreatingSession ? "pointer-events-none opacity-60" : ""}>
                      <SingleSessionForm
                        conferenceId={conferenceId}
                        roomId={roomId!}
                        roomDisplayName={roomDisplayName || "N/A"}
                        roomNumber={roomNumber || undefined}
                        date={date!}
                        startTime={selectedSlot.startTime}
                        endTime={selectedSlot.endTime}
                        onSave={handleSessionSave}
                        onCancel={handleBackToView}
                      />
                      {isCreatingSession && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-sm font-medium">Đang lưu session vào hệ thống...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {date && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{formatDate(date)}</span>
                          </div>
                        </div>
                      )}

                      {/* PHẦN 1: KHUNG GIỜ TRỐNG */}
                      <div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            {isWholeDay ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-green-700 font-semibold">
                                  Phòng trống cả ngày
                                </span>
                              </>
                            ) : timeSpans.length > 0 ? (
                              <>
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                <span className="text-orange-700 font-semibold">
                                  Phòng trống một phần ({timeSpans.length} khung giờ)
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <span className="text-red-700 font-semibold">
                                  Phòng không có khung giờ trống
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {timeSpans.length > 0 && (
                          <>
                            <label className="text-sm font-semibold text-gray-700 mb-3 block">
                              Khung giờ trống {conferenceId && "(Click để đặt lịch)"}
                            </label>
                            <div className="space-y-3 mb-6">
                              {timeSpans.map((span, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleTimeSlotSelect(span)}
                                  className={`bg-gray-50 rounded-lg p-4 border-l-4 border-green-500 transition-colors ${
                                    conferenceId
                                      ? "hover:bg-green-50 cursor-pointer"
                                      : "cursor-default"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Clock className="w-5 h-5 text-green-500" />
                                      <div>
                                        <div className="text-gray-900 font-medium">
                                          {formatTime(span.startTime)} - {formatTime(span.endTime)}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          Thời lượng: {calculateDuration(span.startTime, span.endTime)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                      {conferenceId ? "Click để đặt" : "Có thể đặt"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Divider */}
                      {timeSpans.length > 0 && sessions.length > 0 && (
                        <div className="border-t border-gray-200 my-6"></div>
                      )}

                      {/* PHẦN 2: SESSION ĐANG CHIẾM PHÒNG */}
                      <SessionList sessions={sessions} isLoading={loadingSessions} />
                    </div>
                  )}

                  {!isLoading && mode === "view" && timeSpans.length === 0 && sessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Không có thông tin về phòng này</p>
                    </div>
                  )}
                </div>

                {/* Footer - Only show in view mode */}
                {mode === "view" && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      onClick={handleClose}
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RoomDetailDialog;