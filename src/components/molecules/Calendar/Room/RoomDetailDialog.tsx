import React, { Fragment } from "react";
import { Clock, DoorOpen, Calendar, X, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useGetAvailableTimesInRoomQuery } from "@/redux/services/room.service";

interface RoomDetailDialogProps {
  open: boolean;
  roomId: string | null;
  date: string | null;
  onClose: () => void;
}

const RoomDetailDialog: React.FC<RoomDetailDialogProps> = ({
  open,
  roomId,
  date,
  onClose,
}) => {
  const { data: timesData, isLoading } = useGetAvailableTimesInRoomQuery(
    { roomId: roomId!, date: date! },
    { skip: !roomId || !date || !open }
  );

  const timeSpans = timesData?.data || [];
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

  return (
    <Transition appear show={open} as={Fragment} unmount={true}>
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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-gray-800 border border-gray-700 shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <DoorOpen className="w-6 h-6 text-white" />
                      <DialogTitle className="text-xl font-bold text-white">
                        Chi tiết phòng trống
                      </DialogTitle>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-green-500/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Date Info */}
                      {date && (
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-gray-200">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <span className="font-medium">{formatDate(date)}</span>
                          </div>
                        </div>
                      )}

                      {/* Availability Status */}
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {isWholeDay ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <span className="text-green-400 font-semibold">
                                Phòng trống cả ngày
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-orange-400" />
                              <span className="text-orange-400 font-semibold">
                                Phòng trống một phần ({timeSpans.length} khung giờ)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Time Spans */}
                      <div>
                        <label className="text-sm font-semibold text-gray-400 mb-3 block">
                          Khung giờ trống
                        </label>
                        <div className="space-y-3">
                          {timeSpans.map((span, index) => (
                            <div
                              key={index}
                              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Clock className="w-5 h-5 text-blue-400" />
                                  <div>
                                    <div className="text-white font-medium">
                                      {formatTime(span.startTime)} - {formatTime(span.endTime)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Thời lượng: {calculateDuration(span.startTime, span.endTime)}
                                    </div>
                                  </div>
                                </div>
                                <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">
                                  Có thể đặt
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {timeSpans.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                          <p>Không có khung giờ trống</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RoomDetailDialog;