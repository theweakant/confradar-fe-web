import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/redux/hooks/useAuth";
import {
  useGetAllConferenceStatusesQuery,
  useUpdateOwnConferenceStatusMutation,
} from "@/redux/services/status.service";
import { ApiResponse } from "@/types/api.type";

interface Conference {
  conferenceId: string;
  conferenceStatusId: string;
  conferenceStatusName?: string;
  [key: string]: any;
}

interface UpdateConferenceStatusProps {
  open: boolean;
  onClose: () => void;
  conference: Conference;
}

const normalizeStatus = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, "");
};

export const UpdateConferenceStatus: React.FC<UpdateConferenceStatusProps> = ({
  open,
  onClose,
  conference,
}) => {
  const { role } = useAuth();
    const { data: statusData, refetch } = useGetAllConferenceStatusesQuery();
  const [updateStatus, { isLoading }] = useUpdateOwnConferenceStatusMutation();

  const [newStatus, setNewStatus] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const currentStatus = useMemo(() => {
    const statusId = conference?.conferenceStatusId;
    if (!statusId || !statusData?.data) return "N/A";

    const matchedStatus = statusData.data.find(
      (s: any) => s.conferenceStatusId === statusId
    );
    return matchedStatus?.conferenceStatusName || "N/A";
  }, [conference?.conferenceStatusId, statusData]);

  const normalizedCurrentStatus = normalizeStatus(currentStatus);

    // Hàm trả về class màu text cho trạng thái
    const getStatusColor = (status: string): string => {
    const normalized = normalizeStatus(status);

    switch (normalized) {
        case "preparing":
        return "text-yellow-600 bg-yellow-100 border border-yellow-300";
        case "ready":
        return "text-blue-600 bg-blue-100 border border-blue-300";
        case "completed":
        return "text-green-600 bg-green-100 border border-green-300";
        case "onhold":
        return "text-orange-600 bg-orange-100 border border-orange-300";
        case "canceled":
        return "text-red-600 bg-red-100 border border-red-300";
        default:
        return "text-gray-600 bg-gray-100 border border-gray-300";
    }
    };



  const availableStatuses = useMemo<string[]>(() => {
    if (!role || normalizedCurrentStatus === "unknown") return [];

    const roleLower = role.toLowerCase();

    if (roleLower.includes("collaborator")) {
      switch (normalizedCurrentStatus) {
        case "preparing":
          return ["Ready", "Canceled"];
        case "ready":
          return ["Completed", "OnHold"];
        case "onhold":
          return ["Ready", "Canceled"];
        default:
          return [];
      }
    }

    return [];
  }, [role, normalizedCurrentStatus]);

  const handleSubmit = async () => {
    if (!newStatus) return toast.error("Vui lòng chọn trạng thái mới");

    try {
      const res: ApiResponse = await updateStatus({
        confid: conference.conferenceId,
        newStatus,
        reason,
      }).unwrap();

      if (res.success) {
        toast.success("Cập nhật trạng thái  thành công!");
        await refetch();
        setNewStatus("");
        setReason("");
        onClose();;
      } else {
        toast.error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái hội thảo</DialogTitle>
        </DialogHeader>

        {/* Current & New Status trên cùng hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <Label className="text-sm font-medium">Trạng thái hiện tại</Label>
            <p className={`text-sm font-semibold mt-3 px-2 py-1 rounded-md inline-block ${getStatusColor(
                currentStatus
            )}`}
            >
            {currentStatus}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Trạng thái mới</Label>
            <Select
              onValueChange={setNewStatus}
              value={newStatus}
              disabled={availableStatuses.length === 0}
            >
              <SelectTrigger className="mt-3">
                <SelectValue placeholder="Chọn trạng thái mới" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableStatuses.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Không có trạng thái chuyển tiếp hợp lệ.
              </p>
            )}
          </div>
        </div>

        <div className="">
          <Label className="text-sm font-medium mb-4">Lý do (tùy chọn)</Label>
          <Textarea
            placeholder="Nhập lý do (nếu có)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};