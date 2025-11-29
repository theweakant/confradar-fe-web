// src/components/SessionDetailDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { SessionDetailForScheduleResponse } from "@/types/conference.type";

interface SessionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  session: SessionDetailForScheduleResponse | null;
}

const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({
  open,
  onClose,
  session,
}) => {
  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Chi tiết phiên
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Session Title & Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
            {session.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {session.description}
              </p>
            )}
          </div>

          {/* Session Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Date */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mt-0.5">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Ngày</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.sessionDate}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mt-0.5">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Thời gian</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.startTime} – {session.endTime}
                </p>
              </div>
            </div>

            {/* Room */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mt-0.5">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Phòng</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.roomDisplayName || "Chưa chỉ định"}
                </p>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          {/* <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-600 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Đây là chế độ xem thông tin phiên. Để gán bài báo, vui lòng chọn bài báo từ danh sách bên phải và click vào phiên trên lịch.
            </p>
          </div> */}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailDialog;