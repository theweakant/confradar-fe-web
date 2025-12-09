"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Ban } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllConferenceStatusesQuery,
  useDisableConferenceMutation,
} from "@/redux/services/status.service";

interface DisableTechConferenceModalProps {
  open: boolean;
  onClose: () => void;
  conferenceId: string;
  conferenceName: string;
  conferenceStatusId: string;
  onSuccess?: () => void;
}

export const DisableTechConferenceModal: React.FC<DisableTechConferenceModalProps> = ({
  open,
  onClose,
  conferenceId,
  conferenceName,
  conferenceStatusId,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const { data: statusData } = useGetAllConferenceStatusesQuery();
  const [disableConference, { isLoading }] = useDisableConferenceMutation();

  // Lấy tên trạng thái hiện tại
  const currentStatusName = (() => {
    if (!conferenceStatusId || !statusData?.data) return "N/A";
    const status = statusData.data.find(
      (s) => s.conferenceStatusId === conferenceStatusId
    );
    return status?.conferenceStatusName || "N/A";
  })();

  // Chỉ cho phép disable nếu đang ở trạng thái "Ready"
  const canDisable = currentStatusName.toLowerCase() === "ready";

  // Reset form khi đóng/mở
  useEffect(() => {
    if (open) {
      setReason("");
      setReasonError(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setReasonError(true);
      toast.error("Vui lòng nhập lý do vô hiệu hóa hội thảo.");
      return;
    }

    try {
      await disableConference({
        conferenceId,
        reason: reason.trim(),
      }).unwrap();

      toast.success("Hội thảo đã được vô hiệu hóa thành công.");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi vô hiệu hóa hội thảo:", err);
      toast.error("Vô hiệu hóa thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="w-5 h-5" />
            Vô hiệu hóa hội thảo kỹ thuật
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin hội thảo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-800">Tên hội thảo</Label>
              <p className="mt-1 text-base font-semibold text-indigo-700">{conferenceName}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-800">Trạng thái hiện tại</Label>
              <p className="mt-1 text-base font-semibold text-gray-700">{currentStatusName}</p>
            </div>
          </div>

          {/* Lý do */}
          <div className="space-y-2">
            <Label htmlFor="disable-reason" className="text-sm font-semibold text-gray-800">
              Lý do vô hiệu hóa <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="disable-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError(false);
              }}
              placeholder="Ví dụ: Thay đổi địa điểm, hủy do thiếu diễn giả..."
              className={`min-h-[80px] ${reasonError ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {reasonError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Vui lòng nhập lý do
              </p>
            )}
          </div>

          {/* Cảnh báo */}
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-lg leading-relaxed">
            <p className="font-semibold mb-2">Hậu quả khi vô hiệu hóa</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Người dùng sẽ không thể truy cập hoặc đăng ký</li>
              <li>Hội thảo sẽ chuyển sang trạng thái <span className="font-semibold">&quot;Disabled&quot;</span></li>
            </ul>
            <p className="mt-2 font-medium text-red-900">
              Hành động này không thể hoàn tác trừ khi khôi phục thủ công.
            </p>
          </div>

          {/* Cảnh báo nếu không ở trạng thái Ready */}
          {!canDisable && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>
                  Chỉ có thể vô hiệu hóa khi hội thảo đang ở trạng thái{" "}
                  <span className="font-semibold">&quot;Ready&quot;</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !canDisable}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận vô hiệu hóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};