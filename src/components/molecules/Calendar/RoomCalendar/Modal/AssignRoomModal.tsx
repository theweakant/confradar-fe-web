import React, { Fragment, useState, useMemo } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X, MapPin, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useGetAvailableRoomsBetweenDatesQuery } from "@/redux/services/room.service";
import type { Session, ResearchSession } from "@/types/conference.type";
import type { AvailableRoom } from "@/types/room.type";

interface AssignRoomModalProps {
  open: boolean;
  session: Session | ResearchSession | null;
  existingSessions: (Session | ResearchSession)[];
  onClose: () => void;
  onConfirm: (updatedSession: Session | ResearchSession) => void;
}

export const AssignRoomModal: React.FC<AssignRoomModalProps> = ({
  open,
  session,
  existingSessions,
  onClose,
  onConfirm,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionDate = session?.date || "";
  
  const { data: roomsData, isLoading } = useGetAvailableRoomsBetweenDatesQuery(
    {
      startdate: sessionDate,
      endate: sessionDate,
    },
    { skip: !sessionDate || !open }
  );

  const availableRooms = useMemo(() => {
    if (!session || !roomsData?.data) return [];

    const sessionStartTime = session.startTime.includes('T') 
      ? session.startTime.split('T')[1] 
      : session.startTime;
    const sessionEndTime = session.endTime.includes('T') 
      ? session.endTime.split('T')[1] 
      : session.endTime;

    return roomsData.data.filter((room) => {
      if (room.date !== session.date) return false;

      // Kiểm tra xung đột với session khác
      const hasConflict = existingSessions.some((existingSession) => {
        if (existingSession.sessionId === session.sessionId) return false;
        if (existingSession.roomId !== room.roomId) return false;
        if (existingSession.date !== session.date) return false;

        const existingStart = existingSession.startTime.includes('T')
          ? existingSession.startTime.split('T')[1]
          : existingSession.startTime;
        const existingEnd = existingSession.endTime.includes('T')
          ? existingSession.endTime.split('T')[1]
          : existingSession.endTime;

        return !(sessionEndTime <= existingStart || sessionStartTime >= existingEnd);
      });

      if (hasConflict) return false;

      // Kiểm tra khung giờ trống
      if (room.isAvailableWholeday) return true;

      return room.availableTimeSpans.some((span) => {
        return sessionStartTime >= span.startTime && sessionEndTime <= span.endTime;
      });
    });
  }, [session, roomsData, existingSessions]);

  const formatTime = (timeStr: string) => {
    if (timeStr.includes('T')) {
      return timeStr.split('T')[1].slice(0, 5);
    }
    return timeStr.slice(0, 5);
  };

  const handleConfirm = async () => {
    if (!selectedRoom || !session) {
      toast.error("Vui lòng chọn phòng!");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedRoomData = availableRooms.find(r => r.roomId === selectedRoom);
      
      const updatedSession: Session | ResearchSession = {
        ...session,
        roomId: selectedRoom,
        roomNumber: selectedRoomData?.roomNumber || undefined,
        roomDisplayName: selectedRoomData?.roomDisplayName || undefined,
      };

      onConfirm(updatedSession);
      toast.success("Đã gán phòng thành công!");
      handleClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gán phòng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRoom(null);
    onClose();
  };

  if (!session) return null;

  return (
    <Transition appear show={open} as={Fragment}>
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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-white" />
                      <div>
                        <DialogTitle className="text-lg font-semibold text-white">
                          Gán phòng cho session
                        </DialogTitle>
                        <div className="text-xs text-green-100 mt-0.5">
                          {session.title}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="p-1.5 hover:bg-green-500/50 rounded-md transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-blue-900 font-medium mb-1">Thông tin session</p>
                        <p className="text-blue-800">
                          <span className="font-medium">Thời gian:</span>{" "}
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </p>
                        <p className="text-blue-800">
                          <span className="font-medium">Ngày:</span>{" "}
                          {new Date(session.date).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : availableRooms.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Không có phòng trống phù hợp với khung giờ này
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Chọn phòng ({availableRooms.length} phòng khả dụng)
                      </label>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {availableRooms.map((room) => (
                          <div
                            key={room.roomId}
                            onClick={() => setSelectedRoom(room.roomId)}
                            className={`
                              border rounded-lg p-4 cursor-pointer transition-all
                              ${
                                selectedRoom === room.roomId
                                  ? "border-green-500 bg-green-50 shadow-md"
                                  : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {selectedRoom === room.roomId && (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {room.roomDisplayName || `Phòng ${room.roomNumber}`}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {room.isAvailableWholeday
                                      ? "Trống cả ngày"
                                      : `${room.availableTimeSpans.length} khung giờ trống`}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`
                                  px-3 py-1 rounded-full text-xs font-medium
                                  ${
                                    room.isAvailableWholeday
                                      ? "bg-green-100 text-green-700"
                                      : "bg-blue-100 text-blue-700"
                                  }
                                `}
                              >
                                {room.isAvailableWholeday ? "Cả ngày" : "Một phần"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedRoom || isSubmitting || availableRooms.length === 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
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