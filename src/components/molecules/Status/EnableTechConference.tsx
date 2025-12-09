// components/molecules/Status/EnableTechConferenceModal.tsx

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
import { AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllConferenceStatusesQuery,
  useTransitionConferenceFromDisableToReadyMutation,
} from "@/redux/services/status.service";

interface EnableTechConferenceModalProps {
  open: boolean;
  onClose: () => void;
  conferenceId: string;
  conferenceName: string;
  conferenceStatusId: string;
  onSuccess?: () => void;
}

export const EnableTechConferenceModal: React.FC<EnableTechConferenceModalProps> = ({
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
  const [enableConference, { isLoading }] = useTransitionConferenceFromDisableToReadyMutation();

  const currentStatusName = (() => {
    if (!conferenceStatusId || !statusData?.data) return "N/A";
    const status = statusData.data.find(
      (s) => s.conferenceStatusId === conferenceStatusId
    );
    return status?.conferenceStatusName || "N/A";
  })();

  // Chỉ cho phép khôi phục nếu đang ở trạng thái "Disabled"
  const canEnable = currentStatusName.toLowerCase() === "disabled";

  useEffect(() => {
    if (open) {
      setReason("");
      setReasonError(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setReasonError(true);
      toast.error("Vui lòng nhập lý do khôi phục hội thảo.");
      return;
    }

    try {
      await enableConference({
        conferenceId,
        reason: reason.trim(),
      }).unwrap();

      toast.success("Hội thảo đã được khôi phục và cập nhật mốc thời gian thành công.");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi khôi phục hội thảo:", err);
      toast.error("Khôi phục thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <RotateCcw className="w-5 h-5" />
            Khôi phục hội thảo kỹ thuật
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="enable-reason" className="text-sm font-semibold text-gray-800">
              Lý do khôi phục <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="enable-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError(false);
              }}
              placeholder="Ví dụ: Đã xử lý xong sự cố, sẵn sàng mở lại hội thảo..."
              className={`min-h-[80px] ${reasonError ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {reasonError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Vui lòng nhập lý do
              </p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm p-4 rounded-lg leading-relaxed">
            <p className="font-semibold mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Tự động cập nhật mốc thời gian
            </p>
            <p>
              Hệ thống sẽ <span className="font-semibold">tự động cập nhật các mốc thời gian đã qua</span> do
              hội thảo bị vô hiệu hóa trước đó.
            </p>
            <p className="mt-2">
              Trạng thái hội thảo sẽ chuyển sang <span className="font-semibold">&quot;Ready&quot;</span>.
            </p>
          </div>

          {!canEnable && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>
                  Chỉ có thể khôi phục khi hội thảo đang ở trạng thái{" "}
                  <span className="font-semibold">&quot;Disabled&quot;</span>.
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
            disabled={isLoading || !canEnable}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận khôi phục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};