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
      <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Chi tiết phiên
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Session Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-blue-400">{session.title}</h3>
              <p className="text-gray-300 text-sm">
                {session.description || "Không có mô tả"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Ngày:</span>
                <p className="text-white">{session.sessionDate}</p>
              </div>
              <div>
                <span className="text-gray-400">Thời gian:</span>
                <p className="text-white">
                  {session.startTime} – {session.endTime}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Phòng:</span>
                <p className="text-white">{session.roomId || "Chưa chỉ định"}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 italic">
            Đây là chế độ xem chỉ đọc. Không hiển thị bài báo đã gán.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-200 hover:bg-gray-700"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailDialog;