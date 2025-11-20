// import React, { Fragment, useState } from "react";
// import { Clock, DoorOpen, Calendar, X, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
// import {
//   Dialog,
//   DialogPanel,
//   DialogTitle,
//   Transition,
//   TransitionChild,
// } from "@headlessui/react";
// import { 
//   useGetAvailableTimesInRoomQuery,
//   useGetSessionsInRoomOnDateQuery 
// } from "@/redux/services/room.service";
// import { SessionList } from "../Session/SessionList";
// import { SingleSessionForm } from "../Form/SingleSessionForm";
// import { ResearchSingleSessionForm } from "../Form/ResearchSingleSessionForm";

// import type { Session } from "@/types/conference.type";

// interface RoomDetailDialogProps {
//   open: boolean;
//   roomId: string | null;
//   roomNumber?: string | null;
//   roomDisplayName?: string | null;
//   date: string | null;
//   conferenceId?: string; 
//   conferenceType?: "Tech" | "Research";
//   existingSessions?: Session[];
//   onClose: () => void;
//   onSessionCreated?: (session: Session) => void; 
// }

// const RoomDetailDialog: React.FC<RoomDetailDialogProps> = ({
//   open,
//   roomId,
//   roomNumber,
//   roomDisplayName,
//   date,
//   conferenceId,
//   conferenceType = "Tech",
//   existingSessions = [],
//   onClose,
//   onSessionCreated,
// }) => {
//   const [mode, setMode] = useState<"view" | "form">("view");
  
//   const [selectedSlot, setSelectedSlot] = useState<{
//     startTime: string;
//     endTime: string;
//   } | null>(null);
//   const [isCreatingSession, setIsCreatingSession] = useState(false);

//   const { data: timesData, isLoading: loadingTimes } = useGetAvailableTimesInRoomQuery(
//     { roomId: roomId!, date: date! },
//     { skip: !roomId || !date || !open }
//   );

//   const { data: sessionsData, isLoading: loadingSessions } = useGetSessionsInRoomOnDateQuery(
//     { roomId: roomId!, date: date! },
//     { skip: !roomId || !date || !open }
//   );

//   const SessionFormComponent = conferenceType === "Research" 
//     ? ResearchSingleSessionForm 
//     : SingleSessionForm;

//   const timeSpans = timesData?.data || [];
//   const sessions = sessionsData?.data || [];
  
//   const isWholeDay = timeSpans.length === 1 && 
//     timeSpans[0].startTime === "00:00:00" && 
//     timeSpans[0].endTime === "23:59:59";

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("vi-VN", {
//       weekday: "long",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   const formatTime = (timeString: string) => {
//     return timeString.slice(0, 5);
//   };

//   const calculateDuration = (start: string, end: string) => {
//     const startMinutes = parseInt(start.slice(0, 2)) * 60 + parseInt(start.slice(3, 5));
//     const endMinutes = parseInt(end.slice(0, 2)) * 60 + parseInt(end.slice(3, 5));
//     const diffMinutes = endMinutes - startMinutes;
//     const hours = Math.floor(diffMinutes / 60);
//     const minutes = diffMinutes % 60;
//     return `${hours}h${minutes > 0 ? ` ${minutes}p` : ''}`;
//   };

//   const handleTimeSlotSelect = (span: { startTime: string; endTime: string }) => {
//     if (!conferenceId) {
//       return;
//     }

//     const dateStr = date!;
//     const startISO = `${dateStr}T${span.startTime}`;
//     const endISO = `${dateStr}T${span.endTime}`;

//     setSelectedSlot({
//       startTime: startISO,
//       endTime: endISO,
//     });
//     setMode("form");
//   };

//   const handleBackToView = () => {
//     setMode("view");
//     setSelectedSlot(null);
//   };

//   const handleSessionSave = async (session: Session) => {
//     if (onSessionCreated) {
//       setIsCreatingSession(true);
//       try {
//         await onSessionCreated(session);
//         setMode("view");
//         setSelectedSlot(null);
//       } catch (error) {
//         console.error("Failed to create session:", error);
//       } finally {
//         setIsCreatingSession(false);
//       }
//     }
//   };

//   const handleClose = () => {
//     setMode("view");
//     setSelectedSlot(null);
//     onClose();
//   };

//   const isLoading = loadingTimes || loadingSessions;

//   return (
//     <Transition appear show={open} as={Fragment} unmount={true}>
//       <Dialog as="div" className="relative z-50" onClose={handleClose}>
//         <TransitionChild
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
//         </TransitionChild>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <TransitionChild
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3 flex-1">
//                       {mode === "form" ? (
//                         <>
//                           <button
//                             onClick={handleBackToView}
//                             disabled={isCreatingSession}  
//                             className="p-1.5 hover:bg-green-500/50 rounded-md transition-colors disabled:opacity-50"
//                           >
//                             <ArrowLeft className="w-5 h-5 text-white" />
//                           </button>
//                           <div>
//                             <DialogTitle className="text-lg font-semibold text-white">
//                               Tạo phiên họp
//                             </DialogTitle>
//                             <div className="text-xs text-green-100 mt-0.5">
//                               {roomDisplayName || `Phòng ${roomNumber}`}
//                             </div>
//                           </div>
//                         </>
//                       ) : (
//                         <>
//                           <DoorOpen className="w-5 h-5 text-white" />
//                           <div>
//                             <DialogTitle className="text-lg font-semibold text-white">
//                               {roomDisplayName || `Phòng ${roomNumber}`}
//                             </DialogTitle>
//                             <div className="text-xs text-green-100 mt-0.5">
//                               Chi tiết phòng họp
//                             </div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                     <button
//                       onClick={handleClose}
//                       disabled={isCreatingSession} 
//                       className="p-1.5 hover:bg-green-500/50 rounded-md transition-colors disabled:opacity-50"
//                     >
//                       <X className="w-5 h-5 text-white" />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-5 max-h-[70vh] overflow-y-auto">
//                   {isLoading ? (
//                     <div className="flex items-center justify-center h-48">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//                     </div>
//                   ) : mode === "form" && selectedSlot && conferenceId ? (
//                     <div className={isCreatingSession ? "pointer-events-none opacity-60" : ""}>
//                       <SessionFormComponent
//                         conferenceId={conferenceId}
//                         roomId={roomId!}
//                         roomDisplayName={roomDisplayName || "N/A"}
//                         roomNumber={roomNumber || undefined}
//                         date={date!}
//                         startTime={selectedSlot.startTime}
//                         endTime={selectedSlot.endTime}
//                         existingSessions={existingSessions}
//                         onSave={handleSessionSave}
//                         onCancel={handleBackToView}
//                       />
//                       {isCreatingSession && (
//                         <div className="mt-4 flex items-center justify-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
//                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
//                           <span className="text-sm font-medium">Đang lưu phiên họp...</span>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="space-y-5">
//                       {date && (
//                         <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
//                           <div className="flex items-center gap-2 text-gray-700">
//                             <Calendar className="w-4 h-4 text-blue-600" />
//                             <span className="text-sm font-medium">{formatDate(date)}</span>
//                           </div>
//                         </div>
//                       )}

//                       {/* PHẦN 1: KHUNG GIỜ TRỐNG */}
//                       <div>
//                         <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
//                           <div className="flex items-center gap-2">
//                             {isWholeDay ? (
//                               <>
//                                 <CheckCircle className="w-4 h-4 text-green-600" />
//                                 <span className="text-green-700 font-medium text-sm">
//                                   Phòng trống cả ngày
//                                 </span>
//                               </>
//                             ) : timeSpans.length > 0 ? (
//                               <>
//                                 <AlertCircle className="w-4 h-4 text-blue-600" />
//                                 <span className="text-blue-700 font-medium text-sm">
//                                   Phòng trống một phần ({timeSpans.length} khung giờ)
//                                 </span>
//                               </>
//                             ) : (
//                               <>
//                                 <AlertCircle className="w-4 h-4 text-red-600" />
//                                 <span className="text-red-700 font-medium text-sm">
//                                   Phòng không có khung giờ trống
//                                 </span>
//                               </>
//                             )}
//                           </div>
//                         </div>

//                         {timeSpans.length > 0 && (
//                           <>
//                             <label className="text-sm font-semibold text-gray-700 mb-2 block">
//                               Khung giờ trống {conferenceId && "(Click để tạo phiên)"}
//                             </label>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                               {timeSpans.map((span, index) => (
//                                 <div
//                                   key={index}
//                                   onClick={() => handleTimeSlotSelect(span)}
//                                   className={`bg-white rounded-lg p-3 border-l-4 transition-all ${
//                                     conferenceId
//                                       ? "border-green-500 hover:bg-green-50 hover:shadow-sm cursor-pointer"
//                                       : "border-gray-300 cursor-default"
//                                   }`}
//                                 >
//                                   <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                       <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
//                                       <div>
//                                         <div className="text-gray-900 font-medium text-sm">
//                                           {formatTime(span.startTime)} - {formatTime(span.endTime)}
//                                         </div>
//                                         <div className="text-xs text-gray-500 mt-0.5">
//                                           Thời lượng: {calculateDuration(span.startTime, span.endTime)}
//                                         </div>
//                                       </div>
//                                     </div>
//                                     <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
//                                       {conferenceId ? "Click để tạo" : "Đặt"}
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </>
//                         )}
//                       </div>

//                       {/* Divider */}
//                       {timeSpans.length > 0 && sessions.length > 0 && (
//                         <div className="border-t border-gray-200"></div>
//                       )}

//                       {/* PHẦN 2: SESSION ĐANG CHIẾM PHÒNG */}
//                       <SessionList sessions={sessions} isLoading={loadingSessions} />
//                     </div>
//                   )}

//                   {!isLoading && mode === "view" && timeSpans.length === 0 && sessions.length === 0 && (
//                     <div className="text-center py-12 text-gray-500">
//                       <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//                       <p className="text-sm">Không có thông tin về phòng này</p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Footer - Only show in view mode */}
//                 {mode === "view" && (
//                   <div className="px-5 py-3 border-t border-gray-200 flex justify-end bg-gray-50">
//                     <button
//                       type="button"
//                       className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors text-sm font-medium"
//                       onClick={handleClose}
//                     >
//                       Đóng
//                     </button>
//                   </div>
//                 )}
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

// export default RoomDetailDialog;


import React, { Fragment, useState, useMemo } from "react";
import {
  Clock,
  DoorOpen,
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  useGetAvailableTimesInRoomQuery,
  useGetSessionsInRoomOnDateQuery,
} from "@/redux/services/room.service";
import { SessionList } from "../Session/SessionList";
import { LocalSessionList } from "../Session/Local/LocalSessionList";
import { SingleSessionForm } from "../Form/SingleSessionForm";
import { ResearchSingleSessionForm } from "../Form/ResearchSingleSessionForm";
import type { Session } from "@/types/conference.type";

interface RoomDetailDialogProps {
  open: boolean;
  roomId: string | null;
  roomNumber?: string | null;
  roomDisplayName?: string | null;
  date: string | null;
  conferenceId?: string;
  conferenceType?: "Tech" | "Research";
  existingSessions?: Session[]; // optional: nếu bạn vẫn muốn sync với cha
  onClose: () => void;

  // Optional callbacks — có thể bỏ nếu quản lý hoàn toàn nội bộ
  onSessionCreated?: (session: Session) => void;
  onSessionUpdated?: (session: Session, index: number) => void;
  onSessionDeleted?: (index: number) => void;
  onChangeDate?: (session: Session, index: number) => void;
  onChangeRoom?: (session: Session, index: number) => void;
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
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingSessionIndex, setEditingSessionIndex] = useState<number>(-1);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  // Quản lý session local trong dialog
  const [localSessions, setLocalSessions] = useState<Session[]>(existingSessions);

  const { data: timesData, isLoading: loadingTimes } = useGetAvailableTimesInRoomQuery(
    { roomId: roomId!, date: date! },
    { skip: !roomId || !date || !open }
  );

  const { data: sessionsData, isLoading: loadingSessions } =
    useGetSessionsInRoomOnDateQuery(
      { roomId: roomId!, date: date! },
      { skip: !roomId || !date || !open }
    );

  const SessionFormComponent = conferenceType === "Research" 
    ? ResearchSingleSessionForm 
    : SingleSessionForm;

  const timeSpans = timesData?.data || [];
  const apiSessions = sessionsData?.data || [];

  // Lọc session local theo phòng & ngày
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

  const handleTimeSlotSelect = (span: { startTime: string; endTime: string }) => {
    if (!conferenceId) return;

    const dateStr = date!;
    const startISO = `${dateStr}T${span.startTime}`;
    const endISO = `${dateStr}T${span.endTime}`;

    setSelectedSlot({ startTime: startISO, endTime: endISO });
    setEditingSession(null);
    setEditingSessionIndex(-1);
    setMode("form");
  };

  const handleBackToView = () => {
    setMode("view");
    setSelectedSlot(null);
    setEditingSession(null);
    setEditingSessionIndex(-1);
  };

  const handleSessionSave = async (session: Session) => {
    setIsCreatingSession(true);
    try {
      if (editingSession && editingSessionIndex >= 0) {
        // Cập nhật
        const updatedSessions = [...localSessions];
        updatedSessions[editingSessionIndex] = session;
        setLocalSessions(updatedSessions);

        if (onSessionUpdated) {
          onSessionUpdated(session, editingSessionIndex);
        }
      } else {
        // Tạo mới
        setLocalSessions((prev) => [...prev, session]);
        if (onSessionCreated) {
          onSessionCreated(session);
        }
      }
      setMode("view");
      setSelectedSlot(null);
      setEditingSession(null);
      setEditingSessionIndex(-1);
    } catch (error) {
      console.error("Failed to save session:", error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleEditSession = (session: Session, index: number) => {
    setEditingSession(session);
    setEditingSessionIndex(index);
    setSelectedSlot({
      startTime: session.startTime,
      endTime: session.endTime,
    });
    setMode("form");
  };

  const handleDeleteSession = (index: number) => {
    const deletedSession = localSessions[index];
    setLocalSessions((prev) => prev.filter((_, i) => i !== index));

    if (onSessionDeleted) {
      onSessionDeleted(index);
    }
    setDeleteConfirmIndex(null);
  };

  const handleClose = () => {
    setMode("view");
    setSelectedSlot(null);
    setEditingSession(null);
    setEditingSessionIndex(-1);
    setDeleteConfirmIndex(null);
    onClose();
  };

  const isLoading = loadingTimes || loadingSessions;

  // Tìm index thực trong mảng gốc (dùng để callback)
  const findActualIndex = (session: Session) => {
    return localSessions.findIndex(
      (s) => s.roomId === roomId && s.date === date && s === session
    );
  };

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
                {/* Header */}
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
                              {editingSession ? "Chỉnh sửa phiên họp" : "Tạo phiên họp"}
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

                {/* Content */}
                <div className="p-5 max-h-[70vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : mode === "form" && selectedSlot && conferenceId ? (
                    <div className={isCreatingSession ? "pointer-events-none opacity-60" : ""}>
                      <SessionFormComponent
                        conferenceId={conferenceId}
                        roomId={roomId!}
                        roomDisplayName={roomDisplayName || "N/A"}
                        roomNumber={roomNumber || undefined}
                        date={date!}
                        startTime={selectedSlot.startTime}
                        endTime={selectedSlot.endTime}
                        existingSessions={localSessions}
                        initialSession={editingSession || undefined}
                        onSave={handleSessionSave}
                        onCancel={handleBackToView}
                      />
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

                      {/* KHUNG GIỜ TRỐNG */}
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

                      {/* Divider */}
                      {(timeSpans.length > 0 || apiSessions.length > 0 || sessionsInThisRoom.length > 0) &&
                        (apiSessions.length > 0 || sessionsInThisRoom.length > 0) && (
                        <div className="border-t border-gray-200"></div>
                      )}

                      {/* SESSION LOCAL — DÙNG LocalSessionList */}
                      {sessionsInThisRoom.length > 0 && (
                        <LocalSessionList
                          sessions={sessionsInThisRoom}
                          title="Phiên họp trong hội thảo"
                          editable={true}
                          renderActions={(session, idx) => {
                            const actualIndex = findActualIndex(session);
                            const isDeleteConfirm = deleteConfirmIndex === actualIndex;

                            return (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleEditSession(session, actualIndex)}
                                  className="p-1 bg-white hover:bg-gray-50 text-gray-600 rounded border border-gray-200"
                                  title="Sửa"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                {isDeleteConfirm ? (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setDeleteConfirmIndex(null)}
                                      className="p-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                      Hủy
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSession(actualIndex)}
                                      className="p-1 text-xs bg-red-600 text-white rounded"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmIndex(actualIndex)}
                                    className="p-1 bg-white hover:bg-red-50 text-red-600 rounded border border-red-200"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}

                                {onChangeDate && (
                                  <button
                                    onClick={() => onChangeDate(session, actualIndex)}
                                    className="p-1 bg-white hover:bg-purple-50 text-purple-600 rounded border border-purple-200"
                                    title="Đổi ngày"
                                  >
                                    <CalendarDays className="w-3 h-3" />
                                  </button>
                                )}
                                {onChangeRoom && (
                                  <button
                                    onClick={() => onChangeRoom(session, actualIndex)}
                                    className="p-1 bg-white hover:bg-orange-50 text-orange-600 rounded border border-orange-200"
                                    title="Đổi phòng"
                                  >
                                    <MapPin className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          }}
                        />
                      )}

                      {/* SESSION TỪ API */}
                      {apiSessions.length > 0 && (
                        <SessionList sessions={apiSessions} isLoading={loadingSessions} />
                      )}

                      {/* Empty state */}
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

                {/* Footer */}
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