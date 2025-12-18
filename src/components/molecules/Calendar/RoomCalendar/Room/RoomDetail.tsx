import React, { Fragment, useState, useMemo } from "react";
import {
  Clock,
  DoorOpen,
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { toast } from "sonner";
import {
  useGetAvailableTimesInRoomQuery,
  useGetSessionsInRoomOnDateQuery,
} from "@/redux/services/room.service";
import { SessionList } from "../Session/SessionList";
import { LocalSessionList } from "../Session/Local/LocalSessionList";
import { SingleSessionForm } from "../Form/TechSessionForm"; //organizer
import { ResearchSingleSessionForm } from "../Form/ResearchSessionForm"
import type { Session, ResearchSession } from "@/types/conference.type";
const normalizeSessionTime = (time: string): string => {
  if (!time) return "";
  
  // Nếu đã là "HH:mm:ss" → giữ nguyên
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // Nếu là ISO → convert
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    console.error("❌ Invalid time format:", time);
    return "00:00:00";
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};
interface RoomDetailDialogProps {
  open: boolean;
  roomId: string | null;
  roomNumber?: string | null;
  roomDisplayName?: string | null;
  date: string | null;
  conferenceId?: string;
  conferenceType?: "Tech" | "Research";
  existingSessions?: (Session | ResearchSession)[];
  onClose: () => void;
  onSessionCreated?: (session: Session | ResearchSession) => void;
  onSessionUpdated?: (session: Session | ResearchSession, index: number) => void;
  onSessionDeleted?: (index: number) => void;
  onChangeDate?: (session: Session | ResearchSession, index: number) => void;
  onChangeRoom?: (session: Session | ResearchSession, index: number) => void;
}

const RoomDetailDialog: React.FC<RoomDetailDialogProps> = ({
  open,
  roomId,
  roomNumber,
  roomDisplayName,
  date,
  conferenceId,
  conferenceType = "Tech",
  existingSessions = [],
  onClose,
  onSessionCreated,
  onSessionUpdated,
  onSessionDeleted,
  onChangeDate,
  onChangeRoom,
}) => {
  const [mode, setMode] = useState<"view" | "form">("view");
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);

  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [showApiSessions, setShowApiSessions] = useState(false);

  const [editingSession, setEditingSession] = useState<Session | ResearchSession | null>(null);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<Session | ResearchSession | null>(null);
  const [localSessions, setLocalSessions] = useState<(Session | ResearchSession)[]>(existingSessions);

  const { data: timesData, isLoading: loadingTimes } = useGetAvailableTimesInRoomQuery(
    { roomId: roomId!, date: date! },
    { skip: !roomId || !date || !open }
  );

  const { data: sessionsData, isLoading: loadingSessions } =
    useGetSessionsInRoomOnDateQuery(
      { roomId: roomId!, date: date! },
      { skip: !roomId || !date || !open }
    );

  const timeSpans = timesData?.data || [];
  const apiSessions = sessionsData?.data || [];

  const sessionsInThisRoom = useMemo(() => {
    return localSessions.filter((s) => s.roomId === roomId && s.date === date);
  }, [localSessions, roomId, date]);

  const isWholeDay =
    timeSpans.length === 1 &&
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

  const formatTime = (timeString: string) => timeString.slice(0, 5);

  const calculateDuration = (start: string, end: string) => {
    const startMinutes = parseInt(start.slice(0, 2)) * 60 + parseInt(start.slice(3, 5));
    const endMinutes = parseInt(end.slice(0, 2)) * 60 + parseInt(end.slice(3, 5));
    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
  };

  const findActualIndex = (session: Session | ResearchSession): number => {
    if (session.sessionId) {
      return localSessions.findIndex((s) => s.sessionId === session.sessionId);
    }
    return localSessions.findIndex(
      (s) =>
        s.title === session.title &&
        s.startTime === session.startTime &&
        s.endTime === session.endTime &&
        s.roomId === session.roomId &&
        s.date === session.date
    );
  };

  const handleTimeSlotSelect = (span: { startTime: string; endTime: string }) => {
     if (!conferenceId || !date) {
      toast.error('Không thể tạo session: Thiếu thông tin ngày');
      return;
    }

    const dateStr = date!;
    const startISO = `${dateStr}T${span.startTime}`;
    const endISO = `${dateStr}T${span.endTime}`;

    setSelectedSlot({ startTime: startISO, endTime: endISO });
    setEditingSession(null);
    setMode("form");
  };
  
  const handleBackToView = () => {
    setMode("view");
    setSelectedSlot(null);
    setEditingSession(null);
  };

  // const handleSessionSave = async (session: Session | ResearchSession) => {
  //   setIsCreatingSession(true);

  //   try {
  //     if (editingSession) {
  //       if (!editingSession.sessionId) {
  //         toast.error("Không thể cập nhật session không có ID!");
  //         setIsCreatingSession(false);
  //         return;
  //       }

  //       const updatedSession: Session | ResearchSession = {
  //         ...session,
  //         sessionId: editingSession.sessionId,
  //       };

  //       const actualIndex = findActualIndex(editingSession);

  //       if (actualIndex !== -1) {
  //         const updatedSessions = [...localSessions];
  //         updatedSessions[actualIndex] = updatedSession;
  //         setLocalSessions(updatedSessions);

  //         if (onSessionUpdated) {
  //           await Promise.resolve(onSessionUpdated(updatedSession, actualIndex))
  //             .catch((error) => {
  //               setLocalSessions(localSessions);
  //               toast.error("Cập nhật thất bại!");
  //               throw error;
  //             });
  //         }

  //         setMode("view");
  //         setSelectedSlot(null);
  //         setEditingSession(null);
  //         toast.success(`Đã cập nhật session "${updatedSession.title}"!`);
  //       } else {
  //         toast.error("Không tìm thấy session để cập nhật");
  //       }
  //     } else {
  //       setLocalSessions((prev) => [...prev, session]);
        
  //       if (onSessionCreated) {
  //         onSessionCreated(session);
  //       }
        
  //       setMode("view");
  //       setSelectedSlot(null);
  //       setEditingSession(null);
  //       toast.success(`Đã tạo session "${session.title}"!`);
  //     }
  //   } catch (error) {
  //     toast.error("Có lỗi xảy ra khi lưu session");
  //   } finally {
  //     setIsCreatingSession(false);
  //   }
  // };

const handleSessionSave = async (session: Session | ResearchSession) => {
  setIsCreatingSession(true);

  try {
    // ✅ NORMALIZE NGAY TẠI ĐÂY
    const normalizedSession = {
      ...session,
      startTime: normalizeSessionTime(session.startTime),
      endTime: normalizeSessionTime(session.endTime),
    };
    
    console.log("🟢 RoomDetailDialog - Normalized session:", {
      original: { startTime: session.startTime, endTime: session.endTime },
      normalized: { startTime: normalizedSession.startTime, endTime: normalizedSession.endTime },
    });
    
    if (editingSession) {
      if (!editingSession.sessionId) {
        toast.error("Không thể cập nhật session không có ID!");
        setIsCreatingSession(false);
        return;
      }

      const updatedSession: Session | ResearchSession = {
        ...normalizedSession,  // ✅ DÙNG NORMALIZED
        sessionId: editingSession.sessionId,
      };

      const actualIndex = findActualIndex(editingSession);

      if (actualIndex !== -1) {
        const updatedSessions = [...localSessions];
        updatedSessions[actualIndex] = updatedSession;
        setLocalSessions(updatedSessions);

        if (onSessionUpdated) {
          await Promise.resolve(onSessionUpdated(updatedSession, actualIndex))
            .catch((error) => {
              setLocalSessions(localSessions);
              toast.error("Cập nhật thất bại!");
              throw error;
            });
        }

        setMode("view");
        setSelectedSlot(null);
        setEditingSession(null);
        toast.success(`Đã cập nhật session "${updatedSession.title}"!`);
      } else {
        toast.error("Không tìm thấy session để cập nhật");
      }
    } else {
      setLocalSessions((prev) => [...prev, normalizedSession]);  // ✅ DÙNG NORMALIZED
      
      if (onSessionCreated) {
        onSessionCreated(normalizedSession);  // ✅ DÙNG NORMALIZED
      }
      
      setMode("view");
      setSelectedSlot(null);
      setEditingSession(null);
      toast.success(`Đã tạo session "${normalizedSession.title}"!`);
    }
  } catch (error) {
    toast.error("Có lỗi xảy ra khi lưu session");
  } finally {
    setIsCreatingSession(false);
  }
};

  const handleEditSession = (session: Session | ResearchSession, _filteredIndex: number) => {
    const normalizeTime = (timeStr: string, dateStr: string): string => {
      if (timeStr.includes('T')) {
        return timeStr; 
      }
      return `${dateStr}T${timeStr}`;
    };

    const normalizedSession = {
      ...session,
      startTime: normalizeTime(session.startTime, session.date),
      endTime: normalizeTime(session.endTime, session.date),
    };

    setEditingSession(normalizedSession);
    setSelectedSlot({
      startTime: normalizedSession.startTime,
      endTime: normalizedSession.endTime,
    });
    setMode("form");
  };

  const handleDeleteConfirm = (session: Session | ResearchSession, _filteredIndex: number) => {
    setDeleteConfirmSession(session);
  };

  const handleDeleteSession = () => {
    if (!deleteConfirmSession) return;

    const actualIndex = findActualIndex(deleteConfirmSession);

    if (actualIndex !== -1) {
      const updatedSessions = localSessions.filter((_, i) => i !== actualIndex);
      setLocalSessions(updatedSessions);

      if (onSessionDeleted) {
        onSessionDeleted(actualIndex);
      }
    }

    setDeleteConfirmSession(null);
  };

  const handleChangeDateWrapper = (session: Session | ResearchSession, _filteredIndex: number) => {
    const actualIndex = findActualIndex(session);
    if (actualIndex !== -1 && onChangeDate) {
      onChangeDate(session, actualIndex);
    }
  };

  const handleChangeRoomWrapper = (session: Session | ResearchSession, _filteredIndex: number) => {
    const actualIndex = findActualIndex(session);
    if (actualIndex !== -1 && onChangeRoom) {
      onChangeRoom(session, actualIndex);
    }
  };

  const handleClose = () => {
    setMode("view");
    setSelectedSlot(null);
    setEditingSession(null);
    setDeleteConfirmSession(null);
    setShowApiSessions(false);
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
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {mode === "form" ? (
                        <>
                          <button
                            onClick={handleBackToView}
                            disabled={isCreatingSession}
                            className="p-1.5 hover:bg-green-500/50 rounded-md transition-colors disabled:opacity-50"
                          >
                            <ArrowLeft className="w-5 h-5 text-white" />
                          </button>
                          <div>
                            <DialogTitle className="text-lg font-semibold text-white">
                              {editingSession ? "Chỉnh sửa session" : "Tạo session"}
                            </DialogTitle>
                            <div className="text-xs text-green-100 mt-0.5">
                              {roomDisplayName || `Phòng ${roomNumber}`}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <DoorOpen className="w-5 h-5 text-white" />
                          <div>
                            <DialogTitle className="text-lg font-semibold text-white">
                              {roomDisplayName || `Phòng ${roomNumber}`}
                            </DialogTitle>
                            <div className="text-xs text-green-100 mt-0.5">
                              Chi tiết phòng họp
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isCreatingSession}
                      className="p-1.5 hover:bg-green-500/50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : mode === "form" && selectedSlot && conferenceId ? (
                    <div className={isCreatingSession ? "pointer-events-none opacity-60" : ""}>
                      {conferenceType === "Research" ? (
                        <ResearchSingleSessionForm
                          conferenceId={conferenceId}
                          roomId={roomId!}
                          roomDisplayName={roomDisplayName || "N/A"}
                          roomNumber={roomNumber || undefined}
                          date={date!}
                          startTime={selectedSlot.startTime}
                          endTime={selectedSlot.endTime}
                          existingSessions={localSessions as ResearchSession[]}
                          initialSession={editingSession as ResearchSession | undefined}
                          onSave={handleSessionSave}
                          onCancel={handleBackToView}
                        />
                      ) : (
                        <SingleSessionForm
                          conferenceId={conferenceId}
                          roomId={roomId!}
                          roomDisplayName={roomDisplayName || "N/A"}
                          roomNumber={roomNumber || undefined}
                          date={date!}
                          startTime={selectedSlot.startTime}
                          endTime={selectedSlot.endTime}
                          existingSessions={localSessions as Session[]}
                          initialSession={editingSession as Session | undefined}
                          onSave={handleSessionSave}
                          onCancel={handleBackToView}
                        />
                      )}
                      {isCreatingSession && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                          <span className="text-sm font-medium">Đang lưu phiên họp...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {date && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{formatDate(date)}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
                          <div className="flex items-center gap-2">
                            {isWholeDay ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 font-medium text-sm">
                                  Phòng trống cả ngày
                                </span>
                              </>
                            ) : timeSpans.length > 0 ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700 font-medium text-sm">
                                  Phòng trống một phần ({timeSpans.length} khung giờ)
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-red-700 font-medium text-sm">
                                  Phòng không có khung giờ trống
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {timeSpans.length > 0 && (
                          <>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Khung giờ trống {conferenceId && "(Click để tạo phiên)"}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {timeSpans.map((span, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleTimeSlotSelect(span)}
                                  className={`bg-white rounded-lg p-3 border-l-4 transition-all ${
                                    conferenceId
                                      ? "border-green-500 hover:bg-green-50 hover:shadow-sm cursor-pointer"
                                      : "border-gray-300 cursor-default"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                                      <div>
                                        <div className="text-gray-900 font-medium text-sm">
                                          {formatTime(span.startTime)} - {formatTime(span.endTime)}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          Thời lượng: {calculateDuration(span.startTime, span.endTime)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                                      {conferenceId ? "Click để tạo" : "Đặt"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {(timeSpans.length > 0 || apiSessions.length > 0 || sessionsInThisRoom.length > 0) &&
                        (apiSessions.length > 0 || sessionsInThisRoom.length > 0) && (
                        <div className="border-t border-gray-200"></div>
                      )}

                      {sessionsInThisRoom.length > 0 && (
                        <LocalSessionList
                          sessions={sessionsInThisRoom}
                          title="Session"
                          editable={true}
                          onEdit={handleEditSession}
                          onDelete={handleDeleteConfirm}
                          onChangeDate={handleChangeDateWrapper}
                          onChangeRoom={handleChangeRoomWrapper}
                        />
                      )}

                      {deleteConfirmSession && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
                            <p className="text-gray-600 mb-1">
                              Bạn có chắc chắn muốn xóa phiên họp này?
                            </p>
                            <p className="text-sm font-medium text-gray-800 mb-4">
                              &quot;{deleteConfirmSession.title}&quot;
                            </p>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setDeleteConfirmSession(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleDeleteSession}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {apiSessions.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-semibold text-gray-700">
                                Phòng đang được sử dụng ({apiSessions.length})
                              </span>
                            </div>
                            <button
                              onClick={() => setShowApiSessions(!showApiSessions)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors text-xs font-medium"
                            >
                              {showApiSessions ? "Ẩn" : "Xem"}
                            </button>
                          </div>
                          {showApiSessions && (
                            <SessionList sessions={apiSessions} isLoading={loadingSessions} />
                          )}
                        </div>
                      )}

                      {!isLoading &&
                        mode === "view" &&
                        timeSpans.length === 0 &&
                        apiSessions.length === 0 &&
                        sessionsInThisRoom.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-sm">Không có thông tin về phòng này</p>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {mode === "view" && (
                  <div className="px-5 py-3 border-t border-gray-200 flex justify-end bg-gray-50">
                    <button
                      type="button"
                      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors text-sm font-medium"
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