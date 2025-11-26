import React, { Fragment, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { X, Calendar } from "lucide-react";
import { SingleSessionForm } from "./SingleSessionForm";
import type { Session } from "@/types/conference.type";

interface CollaboratorSessionFormDialogProps {
  open: boolean;
  conferenceId: string;
  conferenceStartDate: string;
  conferenceEndDate: string;
  existingSessions: Session[];
  initialSession?: Session | null;
  onSave: (session: Session) => void;
  onClose: () => void;
}

export function CollaboratorSessionFormDialog({
  open,
  conferenceId,
  conferenceStartDate,
  conferenceEndDate,
  existingSessions,
  initialSession,
  onSave,
  onClose,
}: CollaboratorSessionFormDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    initialSession?.date || conferenceStartDate
  );

  const getDefaultTimeSlot = () => {
    const startTime = initialSession?.startTime || `${selectedDate}T09:00:00`;
    const endTime = initialSession?.endTime || `${selectedDate}T10:00:00`;
    return { startTime, endTime };
  };

  const { startTime, endTime } = getDefaultTimeSlot();

  const handleSave = (session: Session) => {
    const sessionWithoutRoom: Session = {
      ...session,
      roomId: "",
      roomDisplayName: undefined,
      roomNumber: undefined,
    };
    onSave(sessionWithoutRoom);
  };

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
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-white" />
                      <div>
                        <DialogTitle className="text-lg font-semibold text-white">
                          {initialSession ? "Chỉnh sửa phiên họp" : "Tạo phiên họp mới"}
                        </DialogTitle>
                        <div className="text-xs text-blue-100 mt-0.5">
                          Điền thông tin chi tiết cho phiên họp
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

                <div className="p-5 max-h-[75vh] overflow-y-auto">
                  {/* 🔹 Date selector */}
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn ngày tổ chức <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={conferenceStartDate}
                      max={conferenceEndDate}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Từ {new Date(conferenceStartDate).toLocaleDateString("vi-VN")} 
                      {" đến "}
                      {new Date(conferenceEndDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  {/* 🔹 Reuse SingleSessionForm - KHÔNG truyền roomId */}
                  <SingleSessionForm
                    conferenceId={conferenceId}
                    roomId="" // 🔹 Empty string hoặc không truyền nếu optional
                    roomDisplayName="Chưa chọn phòng"
                    date={selectedDate}
                    startTime={startTime}
                    endTime={endTime}
                    existingSessions={existingSessions}
                    initialSession={initialSession || undefined}
                    onSave={handleSave}
                    onCancel={onClose}
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}