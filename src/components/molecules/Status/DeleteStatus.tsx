import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllConferenceStatusesQuery,
  useUpdateOwnConferenceStatusMutation,
} from "@/redux/services/status.service";
import { ApiResponse } from "@/types/api.type";

interface DeleteConferenceStatusProps {
  open: boolean;
  onClose: () => void;
  conference: {
    conferenceId?: string;
    conferenceName?: string;
    conferenceStatusId?: string;
    [key: string]: unknown;
  };
  onSuccess?: () => void;
}

export const DeleteConferenceStatus: React.FC<DeleteConferenceStatusProps> = ({
  open,
  onClose,
  conference,
  onSuccess,
}) => {
  const { data: statusData } = useGetAllConferenceStatusesQuery();
  const [updateStatus, { isLoading }] = useUpdateOwnConferenceStatusMutation();

  const currentStatusName = (() => {
    if (!conference.conferenceStatusId || !statusData?.data) return "N/A";
    const status = statusData.data.find(
      (s) => s.conferenceStatusId === conference.conferenceStatusId
    );
    return status?.conferenceStatusName || "N/A";
  })();

  const deletedStatusId = (() => {
    if (!statusData?.data) return null;
    const deletedStatus = statusData.data.find(
      (s) => s.conferenceStatusName === "Deleted"
    );
    return deletedStatus?.conferenceStatusId || null;
  })();

  const canDelete = currentStatusName === "Draft" || currentStatusName === "Pending";

  const handleDelete = async () => {
    if (!conference.conferenceId) {
      toast.error("Không tìm thấy ID.");
      return;
    }

    if (!canDelete) {
      toast.error(
        `Không thể xóa ở trạng thái "${currentStatusName}". Chỉ có thể xóa ở trạng thái "Draft" hoặc "Pending".`
      );
      return;
    }

    if (!deletedStatusId) {
      toast.error("Không tìm thấy trạng thái 'Deleted' trong hệ thống.");
      return;
    }

    try {
      const res: ApiResponse = await updateStatus({
        confid: conference.conferenceId,
        newStatus: deletedStatusId,
        reason: `Xóa từ trạng thái ${currentStatusName}`,
      }).unwrap();

      if (res.success) {
        toast.success("Xóa thành công!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Xóa thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Xác nhận xóa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grid 2 cột */}
          <div className="grid grid-cols-2 gap-6">
            {conference.conferenceName && (
              <div>
                <Label className="text-sm font-semibold text-gray-800">
                  Tên
                </Label>
                <p className="mt-1 text-base font-semibold text-indigo-700">
                  {conference.conferenceName}
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-gray-800">
                Trạng thái hiện tại
              </Label>
              <p
                className={`mt-1 text-base font-semibold ${
                  currentStatusName === "Draft"
                    ? "text-gray-600"
                    : currentStatusName === "Pending"
                    ? "text-yellow-600"
                    : "text-gray-400"
                }`}
              >
                {currentStatusName}
              </p>
            </div>
          </div>

          {/* Thông tin cảnh báo */}
          {canDelete ? (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl leading-relaxed">
              <p className="font-semibold mb-2">Cảnh báo</p>
              <p>
                Bạn đang thực hiện xóa{" "}
                <span className="font-semibold">
                  &quot;{conference.conferenceName}&quot;
                </span>
                . Hội thảo sẽ chuyển sang trạng thái{" "}
                <span className="font-semibold">&quot;Deleted&quot;</span> và có thể
                không được khôi phục.
              </p>
              <p className="mt-2">Bạn có chắc chắn muốn tiếp tục?</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-xl leading-relaxed">
              <p className="font-semibold mb-2">Không thể xóa</p>
              <p>
                Hội thảo đang ở trạng thái{" "}
                <span className="font-semibold">&quot;{currentStatusName}&quot;</span>.
                Chỉ có thể xóa ở trạng thái{" "}
                <span className="font-semibold">&quot;Draft&quot;</span> hoặc{" "}
                <span className="font-semibold">&quot;Pending&quot;</span>.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading || !canDelete || !conference.conferenceId}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};